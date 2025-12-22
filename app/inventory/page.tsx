"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { InventoryItem, User } from "@/lib/types"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { InventoryDialog } from "@/components/inventory/inventory-dialog"

export default function InventoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchUser()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchItems()
  }, [search, categoryFilter, activeTab])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("[Inventory] Fetch user error:", error)
    }
  }

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (activeTab === "lowStock") params.append("lowStock", "true")

      const response = await fetch(`/api/inventory?${params}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error("[Inventory] Fetch items error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/inventory/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("[Inventory] Fetch categories error:", error)
    }
  }

  const lowStockItems = items.filter((item) => item.quantity <= item.reorder_level)

  // --- Enhanced Search ---
  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.id.toString().toLowerCase().includes(query)
    )
  })

  if (!user) return null

  return (
    <SidebarProvider>
      <AppSidebar user={user} />

      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">Inventory Management</h1>
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-emerald-600 hover:bg-emerald-700 h-10 sm:h-11 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            <TabsList className="bg-white border-b border-gray-200 h-auto p-0 rounded-none w-full justify-start overflow-x-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
              >
                All Items
              </TabsTrigger>
              <TabsTrigger
                value="lowStock"
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap"
              >
                Low Stock
              </TabsTrigger>
            </TabsList>

            {/* All Items Tab */}
            <TabsContent value="all" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Inventory Items</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Manage your store's inventory</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 h-10 sm:h-11 w-full"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[220px] h-10 sm:h-11">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">
                    Loading inventory...
                  </div>
                ) : (
                  <InventoryTable items={filteredItems} onUpdate={fetchItems} />
                )}
              </div>
            </TabsContent>

            {/* Low Stock Tab */}
            <TabsContent value="lowStock" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Low Stock Items</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Items that need to be restocked</p>
                </div>

                {loading ? (
                  <div className="text-center py-16 text-muted-foreground">
                    Loading inventory...
                  </div>
                ) : lowStockItems.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    No items are low in stock.
                  </div>
                ) : (
                  <InventoryTable items={lowStockItems} onUpdate={fetchItems} />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add New Item Modal */}
      {showAddDialog && (
        <InventoryDialog
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            fetchItems()
            fetchCategories()
          }}
        />
      )}
    </SidebarProvider>
  )
}