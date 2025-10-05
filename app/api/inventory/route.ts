import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const lowStock = searchParams.get("lowStock")

    let query = sql`
      SELECT * FROM inventory_items 
      WHERE user_id = ${session.userId}
    `

    if (category && category !== "all") {
      query = sql`
        SELECT * FROM inventory_items 
        WHERE user_id = ${session.userId} AND category = ${category}
      `
    }

    if (search) {
      query = sql`
        SELECT * FROM inventory_items 
        WHERE user_id = ${session.userId} 
        AND (name ILIKE ${`%${search}%`} OR barcode ILIKE ${`%${search}%`})
      `
    }

    if (lowStock === "true") {
      query = sql`
        SELECT * FROM inventory_items 
        WHERE user_id = ${session.userId} AND quantity <= reorder_level
      `
    }

    const items = await query

    return NextResponse.json(items, { status: 200 })
  } catch (error) {
    console.error("[v0] Get inventory error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, quantity, unit, cost_price, selling_price, reorder_level, barcode, description } = body

    if (!name || !category || quantity === undefined || !unit || !cost_price || !selling_price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO inventory_items (
        user_id, name, category, quantity, unit, cost_price, selling_price, 
        reorder_level, barcode, description
      )
      VALUES (
        ${session.userId}, ${name}, ${category}, ${quantity}, ${unit}, 
        ${cost_price}, ${selling_price}, ${reorder_level || 10}, ${barcode || null}, 
        ${description || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Create inventory error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
