"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, AlertTriangle } from "lucide-react"
import type { InventoryItem } from "@/lib/types"
import { InventoryDialog } from "./inventory-dialog"
import { UpdateStockDialog } from "./update-stock-dialog"

interface InventoryTableProps {
  items: InventoryItem[]
  onUpdate: () => void
}

export function InventoryTable({ items, onUpdate }: InventoryTableProps) {
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [updateStockItem, setUpdateStockItem] = useState<InventoryItem | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setDeleteId(id)
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">ID</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Name</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Category</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Stock</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Purchase Price</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Selling Price</TableHead>
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                    No items found. Add your first inventory item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const isLowStock = item.quantity <= item.reorder_level
                  return (
                    <TableRow key={item.id} className={isLowStock ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}>
                      <TableCell className="font-medium whitespace-nowrap">P{item.id}</TableCell>
                      <TableCell className="font-medium max-w-[150px] sm:max-w-none truncate sm:whitespace-normal">{item.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          {item.quantity}
                          {isLowStock && <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">₱{Number(item.cost_price).toFixed(2)}</TableCell>
                      <TableCell className="whitespace-nowrap">₱{Number(item.selling_price).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUpdateStockItem(item)}
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm px-2 sm:px-3"
                          >
                            <span className="hidden sm:inline">Update Stock</span>
                            <span className="sm:hidden">Stock</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setEditItem(item)} className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteId === item.id}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {editItem && <InventoryDialog item={editItem} onClose={() => setEditItem(null)} onSuccess={onUpdate} />}
      {updateStockItem && (
        <UpdateStockDialog
          itemId={updateStockItem.id}
          itemName={updateStockItem.name}
          currentStock={updateStockItem.quantity}
          onClose={() => setUpdateStockItem(null)}
          onSuccess={onUpdate}
        />
      )}
    </>
  )
}
