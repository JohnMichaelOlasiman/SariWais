"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface TransactionItem {
  inventory_item_id?: number
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface TransactionFormProps {
  type: "sale" | "expense"
  onSuccess: () => void
  onClose: () => void
}

export function TransactionForm({ type, onSuccess, onClose }: TransactionFormProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [items, setItems] = useState<TransactionItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [referenceNo, setReferenceNo] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  // quantity is a string so the input can be cleared; convert to number when needed
  const [quantity, setQuantity] = useState<string>("")

  useEffect(() => {
    if (type === "sale") {
      fetchInventoryItems()
    }
  }, [type])

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data)
      }
    } catch (error) {
      console.error("[v0] Fetch inventory error:", error)
    }
  }

  // sanitize input: allow digits and remove leading zeros when more than one digit
  const sanitizeQuantityInput = (raw: string) => {
    // keep empty string to allow user to clear it
    if (raw === "") return ""
    // remove all non-digit characters
    let onlyDigits = raw.replace(/\D+/g, "")
    // remove leading zeros if there are more than 1 digit (so "012" -> "12")
    onlyDigits = onlyDigits.replace(/^0+(?=\d)/, "")
    return onlyDigits
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const sanitized = sanitizeQuantityInput(raw)
    setQuantity(sanitized)
  }

  const getSelectedInventoryItem = () => {
    if (!selectedItemId) return undefined
    return inventoryItems.find((i) => i.id.toString() === selectedItemId)
  }

  const getExistingQuantityInCart = (inventoryItemId: number) => {
    return items
      .filter((i) => i.inventory_item_id === inventoryItemId)
      .reduce((sum, i) => sum + i.quantity, 0)
  }

  const addItem = () => {
    // parse quantity to number only when adding
    const qtyNum = quantity === "" ? NaN : Number.parseInt(quantity, 10)
    if (!selectedItemId || Number.isNaN(qtyNum) || qtyNum <= 0) {
      alert("Please select an item and enter a valid quantity (1 or more).")
      return
    }

    const item = getSelectedInventoryItem()
    if (!item) {
      alert("Selected item not found.")
      return
    }

    const availableStock = Number(item.quantity ?? 0)

    // FRONTEND RULE: do not allow adding if stock <= 0
    if (type === "sale" && availableStock <= 0) {
      alert(`"${item.name}" is out of stock and cannot be added.`)
      return
    }

    // Also enforce that we don't exceed available stock, considering what's already in cart
    if (type === "sale") {
      const alreadyInCart = getExistingQuantityInCart(item.id)
      const totalRequested = alreadyInCart + qtyNum

      if (totalRequested > availableStock) {
        const remaining = Math.max(availableStock - alreadyInCart, 0)
        alert(
          `Not enough stock for "${item.name}". Remaining available: ${remaining}. You already added ${alreadyInCart} to this transaction.`,
        )
        return
      }
    }

    const unitPrice = Number(item.selling_price) || 0

    // If the item is already in the cart, just bump its quantity
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.inventory_item_id === item.id)

      if (existingIndex === -1) {
        const newItem: TransactionItem = {
          inventory_item_id: item.id,
          item_name: item.name,
          quantity: qtyNum,
          unit_price: unitPrice,
          subtotal: qtyNum * unitPrice,
        }
        return [...prev, newItem]
      }

      const updated = [...prev]
      const existing = updated[existingIndex]
      const newQuantity = existing.quantity + qtyNum

      updated[existingIndex] = {
        ...existing,
        quantity: newQuantity,
        subtotal: newQuantity * unitPrice,
      }

      return updated
    })

    setSelectedItemId("")
    setQuantity("")
  }

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))

  const calculateTotal = () => items.reduce((sum, item) => sum + item.subtotal, 0)

  const validateItemsAgainstInventory = () => {
    // Extra safety check before submitting (frontend side)
    if (type !== "sale") return { ok: true }

    const problems: string[] = []

    for (const item of items) {
      if (!item.inventory_item_id) {
        problems.push(`"${item.item_name}" is missing an inventory link.`)
        continue
      }

      const inventory = inventoryItems.find((inv) => inv.id === item.inventory_item_id)
      if (!inventory) {
        problems.push(`"${item.item_name}" no longer exists in inventory.`)
        continue
      }

      const available = Number(inventory.quantity ?? 0)
      if (available <= 0) {
        problems.push(`"${inventory.name}" is out of stock.`)
        continue
      }

      if (item.quantity > available) {
        problems.push(
          `"${inventory.name}" has only ${available} available but you requested ${item.quantity}.`,
        )
      }
    }

    if (problems.length > 0) {
      return { ok: false as const, problems }
    }

    return { ok: true as const }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      alert("Please add at least one item.")
      return
    }

    if (paymentMethod === "gcash" && !referenceNo.trim()) {
      alert("Please enter GCash Reference No.")
      return
    }

    const validation = validateItemsAgainstInventory()
    if (!validation.ok) {
  const problems = validation.problems ?? []
  alert("Cannot complete transaction:\n\n" + problems.join("\n"))
  return
}

    if (loading) return
    setLoading(true)

    try {
      let transactionNotes = ""
      if (customerName) transactionNotes += `Customer: ${customerName}`
      if (notes) transactionNotes += (transactionNotes ? "\n" : "") + notes

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transaction_type: type,
          items,
          payment_method: paymentMethod,
          reference_no: paymentMethod === "gcash" ? referenceNo : null,
          notes: transactionNotes,
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const data = await response.json().catch(() => null)
        alert((data && data.error) || "An error occurred while saving the transaction.")
      }
    } catch (error) {
      console.error("[v0] Submit transaction error:", error)
      alert("An error occurred while saving the transaction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Transaction</DialogTitle>
          <DialogDescription className="text-sm">
            Add items to the transaction and complete the sale.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quantity → Product → Customer */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  // show the string value (allows empty "")
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="h-11"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Product (wide field) */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="product" className="text-sm font-medium">
                  Product
                </Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger
                    id="product"
                    className="h-11 w-full text-sm leading-tight whitespace-normal break-words"
                  >
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {inventoryItems.map((item) => {
                      const rawQty = Number(item.quantity ?? 0)
                      const displayQty = Math.max(rawQty, 0) // avoid showing negative in UI
                      const isOutOfStock = displayQty <= 0

                      return (
                        <SelectItem
                          key={item.id}
                          value={item.id.toString()}
                          disabled={isOutOfStock}
                          className="whitespace-normal break-words text-sm leading-tight"
                        >
                          {item.name} — ₱{Number(item.selling_price).toFixed(2)} (
                          {displayQty} available{isOutOfStock ? " - Out of stock" : ""})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Customer Name below */}
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Customer Name
              </Label>
              <Input
                id="customerName"
                placeholder="Optional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={addItem}
                className="h-11 bg-emerald-600 hover:bg-emerald-700"
              >
                Add Item
              </Button>
            </div>
          </div>

          {/* Added Items */}
          {items.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Selected Items</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium break-words text-sm md:text-base">{item.item_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x ₱{item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <p className="font-semibold text-emerald-600">₱{item.subtotal.toFixed(2)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ₱{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method + Reference No side-by-side */}
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="paymentMethod" className="text-sm font-medium">
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod" className="h-11">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="gcash">GCash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "gcash" && (
              <div className="flex-1 space-y-2">
                <Label htmlFor="referenceNo" className="text-sm font-medium">
                  GCash Reference No.
                </Label>
                <Input
                  id="referenceNo"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter GCash reference number"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value.replace(/\D/g, ""))}
                  className="h-11"
                  required
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || items.length === 0}
              className="h-11 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? "Processing..." : "Complete Transaction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
