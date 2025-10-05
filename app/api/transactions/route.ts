import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

// ==============================
// GET — Fetch Transactions
// ==============================
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const search = searchParams.get("search")

    let result

    // Helper query for aggregation
    const baseSelect = sql`
      SELECT t.*, 
        json_agg(
          json_build_object(
            'id', ti.id,
            'item_name', ti.item_name,
            'quantity', ti.quantity,
            'unit_price', ti.unit_price,
            'subtotal', ti.subtotal
          )
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
    `

    if (search) {
      const searchPattern = `%${search}%`
      if (type && type !== "all" && startDate && endDate) {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.transaction_type = ${type}
            AND t.created_at >= ${startDate}
            AND t.created_at <= ${endDate}
            AND (ti.item_name ILIKE ${searchPattern} OR t.notes ILIKE ${searchPattern})
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else if (type && type !== "all") {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.transaction_type = ${type}
            AND (ti.item_name ILIKE ${searchPattern} OR t.notes ILIKE ${searchPattern})
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else if (startDate && endDate) {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.created_at >= ${startDate}
            AND t.created_at <= ${endDate}
            AND (ti.item_name ILIKE ${searchPattern} OR t.notes ILIKE ${searchPattern})
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND (ti.item_name ILIKE ${searchPattern} OR t.notes ILIKE ${searchPattern})
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      }
    } else {
      if (type && type !== "all" && startDate && endDate) {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.transaction_type = ${type}
            AND t.created_at >= ${startDate}
            AND t.created_at <= ${endDate}
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else if (type && type !== "all") {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.transaction_type = ${type}
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else if (startDate && endDate) {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
            AND t.created_at >= ${startDate}
            AND t.created_at <= ${endDate}
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      } else {
        result = await sql`
          ${baseSelect}
          WHERE t.user_id = ${session.userId}
          GROUP BY t.id
          ORDER BY t.created_at DESC
        `
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[v0] Get transactions error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

// ==============================
// POST — Create New Transaction
// ==============================
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { transaction_type, items, payment_method, reference_no, notes } = body

    if (!transaction_type || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const total_amount = items.reduce((sum: number, item: any) => sum + item.subtotal, 0)

    // ✅ Include reference_number in insert
    const transactionResult = await sql`
      INSERT INTO transactions (
        user_id, transaction_type, total_amount, payment_method, reference_number, notes
      )
      VALUES (
        ${session.userId},
        ${transaction_type},
        ${total_amount},
        ${payment_method || null},
        ${reference_no || null},
        ${notes || null}
      )
      RETURNING *
    `

    const transaction = transactionResult[0]

    // ✅ Insert items
    for (const item of items) {
      await sql`
        INSERT INTO transaction_items (
          transaction_id, inventory_item_id, item_name, quantity, unit_price, subtotal
        )
        VALUES (
          ${transaction.id}, ${item.inventory_item_id || null}, ${item.item_name},
          ${item.quantity}, ${item.unit_price}, ${item.subtotal}
        )
      `

      // ✅ Adjust inventory for sales
      if (transaction_type === "sale" && item.inventory_item_id) {
        await sql`
          UPDATE inventory_items
          SET quantity = quantity - ${item.quantity}
          WHERE id = ${item.inventory_item_id} AND user_id = ${session.userId}
        `
      }
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("[v0] Create transaction error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
