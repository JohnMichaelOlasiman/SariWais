"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { InventoryItem } from "@/lib/types"

interface InventoryDialogProps {
  item?: InventoryItem | null
  onClose: () => void
  onSuccess: () => void
}

export function InventoryDialog({ item, onClose, onSuccess }: InventoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [customCategory, setCustomCategory] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: undefined as number | undefined,
    unit: "pcs",
    cost_price: undefined as number | undefined,
    selling_price: undefined as number | undefined,
    reorder_level: undefined as number | undefined,
    description: "",
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        cost_price: Number(item.cost_price),
        selling_price: Number(item.selling_price),
        reorder_level: item.reorder_level,
        description: item.description || "",
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        quantity: formData.quantity ?? 0,
        cost_price: formData.cost_price ?? 0,
        selling_price: formData.selling_price ?? 0,
        reorder_level: formData.reorder_level ?? 0,
        category: showCustomCategory && customCategory ? customCategory.toUpperCase() : formData.category,
      }

      const url = item ? `/api/inventory/${item.id}` : "/api/inventory"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{item ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          <DialogDescription className="text-sm">
            {item
              ? "Update the details of the selected product."
              : "Enter the details of the new product to add to your inventory."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Stock
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter stock quantity"
                value={formData.quantity === undefined ? "" : formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value ? Number(e.target.value) : undefined })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost_price" className="text-sm font-medium">
                Purchase Price
              </Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                placeholder="Enter purchase price"
                value={formData.cost_price === undefined ? "" : formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value ? Number(e.target.value) : undefined })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price" className="text-sm font-medium">
                Selling Price
              </Label>
              <Input
                id="selling_price"
                type="number"
                step="0.01"
                placeholder="Enter selling price"
                value={formData.selling_price === undefined ? "" : formData.selling_price}
                onChange={(e) =>
                  setFormData({ ...formData, selling_price: e.target.value ? Number(e.target.value) : undefined })
                }
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_level" className="text-sm font-medium">
                Low Stock Threshold
              </Label>
              <Input
                id="reorder_level"
                type="number"
                placeholder="Enter threshold value"
                value={formData.reorder_level === undefined ? "" : formData.reorder_level}
                onChange={(e) =>
                  setFormData({ ...formData, reorder_level: e.target.value ? Number(e.target.value) : undefined })
                }
                className="h-11"
              />
            </div>

            {/* Keep Category Intact */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Category
              </Label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="h-11"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCustomCategory(false)
                      setCustomCategory("")
                    }}
                    className="h-11 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOOD">FOOD</SelectItem>
                      <SelectItem value="BEVERAGES">BEVERAGES</SelectItem>
                      <SelectItem value="TOILETRIES">TOILETRIES</SelectItem>
                      <SelectItem value="SNACKS">SNACKS</SelectItem>
                      <SelectItem value="HOUSEHOLD">HOUSEHOLD</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setShowCustomCategory(true)}
                    className="h-11 w-11 shrink-0 bg-transparent"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-11 bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
