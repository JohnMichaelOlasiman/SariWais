import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    // Get transaction details before deleting
    const transactionResult = await sql`
      SELECT * FROM transactions
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    if (transactionResult.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = transactionResult[0]

    // If it's a sale, restore inventory
    if (transaction.transaction_type === "sale") {
      const itemsResult = await sql`
        SELECT * FROM transaction_items
        WHERE transaction_id = ${id}
      `

      for (const item of itemsResult) {
        if (item.inventory_item_id) {
          await sql`
            UPDATE inventory_items
            SET quantity = quantity + ${item.quantity}
            WHERE id = ${item.inventory_item_id}
          `
        }
      }
    }

    // Delete transaction (cascade will delete items)
    await sql`
      DELETE FROM transactions
      WHERE id = ${id} AND user_id = ${session.userId}
    `

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete transaction error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
