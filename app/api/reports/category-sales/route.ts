import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        ii.category,
        SUM(ti.quantity) as total_quantity,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN inventory_items ii ON ti.inventory_item_id = ii.id
      WHERE t.user_id = ${session.userId}
        AND t.transaction_type = 'sale'
        AND t.created_at >= ${startDate}
        AND t.created_at <= ${endDate}
        AND ii.category IS NOT NULL
      GROUP BY ii.category
      ORDER BY total_revenue DESC
    `

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[v0] Category sales error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
