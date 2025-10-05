"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Transaction } from "@/lib/types"

interface TransactionWithItems extends Transaction {
  items: Array<{
    id: number
    item_name: string
    quantity: number
    unit_price: number
    subtotal: number
  }>
  payment_method?: string
  reference_number?: string
}

interface TransactionListProps {
  transactions: TransactionWithItems[]
  onUpdate: () => void
}

export function TransactionList({ transactions, onUpdate }: TransactionListProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithItems | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transaction? This will restore inventory for sales.")) return

    setDeleteId(id)
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })
      if (response.ok) onUpdate()
    } catch (error) {
      console.error("[v0] Delete error:", error)
    } finally {
      setDeleteId(null)
    }
  }

  const getTotalQuantity = (items: TransactionWithItems["items"]) =>
    items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700">ID</TableHead>
              <TableHead className="font-semibold text-gray-700">Item</TableHead>
              <TableHead className="font-semibold text-gray-700">Quantity</TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="font-semibold text-gray-700">Customer</TableHead>
              <TableHead className="font-semibold text-gray-700">Payment Method</TableHead>
              <TableHead className="font-semibold text-gray-700">Total</TableHead>
              <TableHead className="font-semibold text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  No transactions found. Record your first transaction to get started.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">T{transaction.id}</TableCell>
                  <TableCell>
                    {transaction.items.length > 0
                      ? `${transaction.items[0].item_name}${
                          transaction.items.length > 1 ? ` +${transaction.items.length - 1} more` : ""
                        }`
                      : "-"}
                  </TableCell>
                  <TableCell className="font-medium">{getTotalQuantity(transaction.items)}</TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {transaction.notes?.includes("Customer:")
                      ? transaction.notes.split("\n")[0].replace("Customer: ", "")
                      : "-"}
                  </TableCell>
                  <TableCell className="capitalize">{transaction.payment_method || "N/A"}</TableCell>
                  <TableCell className="font-semibold text-emerald-600">
                    ₱{Number(transaction.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedTransaction(transaction)}>
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deleteId === transaction.id}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Transaction Details Modal */}
      {selectedTransaction && (
        <Dialog open onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Transaction Details</DialogTitle>
              <DialogDescription>
                {new Date(selectedTransaction.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              {/* Payment + Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="capitalize font-medium">{selectedTransaction.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">
                    {selectedTransaction.notes?.includes("Customer:")
                      ? selectedTransaction.notes.split("\n")[0].replace("Customer: ", "")
                      : "-"}
                  </p>
                </div>
              </div>

              {/* GCash Reference */}
              {selectedTransaction.payment_method?.toLowerCase() === "gcash" &&
                selectedTransaction.reference_number &&
                selectedTransaction.reference_number.trim() !== "" && (
                  <div>
                    <p className="text-sm text-muted-foreground">GCash Reference Number</p>
                    <p className="font-medium">{selectedTransaction.reference_number}</p>
                  </div>
                )}

              {/* ✅ Notes (Vertical Scroll + Clean Layout) */}
              {selectedTransaction.notes && (
                <div className="flex flex-col space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <div
                    className="
                      text-sm
                      whitespace-pre-wrap
                      break-words
                      overflow-y-auto
                      overflow-x-hidden
                      max-h-[200px]
                      border
                      rounded-md
                      p-3
                      bg-gray-50
                      leading-relaxed
                    "
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {selectedTransaction.notes.includes("Customer:")
                      ? selectedTransaction.notes.split("\n").slice(1).join("\n") ||
                        "(No additional notes)"
                      : selectedTransaction.notes}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTransaction.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">₱{Number(item.unit_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">₱{Number(item.subtotal).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        ₱{Number(selectedTransaction.total_amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
