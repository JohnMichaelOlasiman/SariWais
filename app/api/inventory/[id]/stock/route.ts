import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { adjustment } = await request.json()
    const { id } = await params
    const itemId = Number.parseInt(id)

    if (isNaN(adjustment)) {
      return NextResponse.json({ error: "Invalid adjustment value" }, { status: 400 })
    }

    // Get current stock
    const [item] = await sql`
      SELECT quantity FROM inventory_items 
      WHERE id = ${itemId} AND user_id = ${session.userId}
    `

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const newQuantity = item.quantity + adjustment

    if (newQuantity < 0) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    // Update stock
    await sql`
      UPDATE inventory_items 
      SET quantity = ${newQuantity}, updated_at = NOW()
      WHERE id = ${itemId} AND user_id = ${session.userId}
    `

    return NextResponse.json({ success: true, newQuantity })
  } catch (error) {
    console.error("[v0] Update stock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
