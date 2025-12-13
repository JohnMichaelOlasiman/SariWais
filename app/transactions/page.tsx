"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import type { User } from "@/lib/types"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { TransactionList } from "@/components/transactions/transaction-list"

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [search, setSearch] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [search, timeFilter])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("[v0] Fetch user error:", error)
    }
  }

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append("search", search)

      const response = await fetch(`/api/transactions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error("[v0] Fetch transactions error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Transaction Management</h1>
              </div>
            </div>
            <Button onClick={() => setShowNewTransaction(true)} className="bg-emerald-600 hover:bg-emerald-700 h-11">
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Transactions</h2>
              <p className="text-sm text-gray-600">View and manage your store's transactions</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by item or customer name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full md:w-[220px] h-11">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-16 text-muted-foreground">Loading transactions...</div>
            ) : (
              <TransactionList transactions={transactions} onUpdate={fetchTransactions} />
            )}
          </div>
        </div>
      </main>

      {showNewTransaction && (
        <TransactionForm type="sale" onSuccess={fetchTransactions} onClose={() => setShowNewTransaction(false)} />
      )}
    </SidebarProvider>
  )
}
