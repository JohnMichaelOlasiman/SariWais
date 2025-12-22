"use client"

import type React from "react"

import { useState } from "react"
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

interface UpdateStockDialogProps {
  itemId: number
  itemName: string
  currentStock: number
  onClose: () => void
  onSuccess: () => void
}

export function UpdateStockDialog({ itemId, itemName, currentStock, onClose, onSuccess }: UpdateStockDialogProps) {
  const [quantity, setQuantity] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantityValue = Number.parseInt(quantity)
    if (isNaN(quantityValue)) {
      alert("Please enter a valid number")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/inventory/${itemId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustment: quantityValue }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        alert(data.error || "Failed to update stock")
      }
    } catch (error) {
      console.error("[v0] Update stock error:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Update Stock</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Update the stock quantity for {itemName}. Use positive values to add stock, negative values to remove.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="quantity" className="text-xs sm:text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity (e.g. 10, -5)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="h-10 sm:h-11 text-sm"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">Current stock: {currentStock}</p>
            </div>
          </div>
          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 sm:h-11 bg-transparent text-sm w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-10 sm:h-11 bg-emerald-600 hover:bg-emerald-700 text-sm w-full sm:w-auto">
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
