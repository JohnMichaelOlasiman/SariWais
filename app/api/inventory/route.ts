// app/api/inventory/route.ts
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

    // Base query
    let query = sql`SELECT * FROM inventory_items WHERE user_id = ${session.userId}`

    if (category && category !== "all") {
      query = sql`${query} AND category = ${category}`
    }

    if (search) {
      const pattern = `%${search}%`
      query = sql`${query} AND name ILIKE ${pattern}`
    }

    if (lowStock === "true") {
      query = sql`${query} AND quantity <= reorder_level`
    }

    query = sql`${query} ORDER BY name ASC`
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
    const {
      name,
      category,
      quantity,
      unit,
      cost_price,
      selling_price,
      reorder_level,
      description,
    } = body

    // validate required
    if (!name || !category || quantity == null || !unit || cost_price == null || selling_price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO inventory_items (
        user_id, name, category, quantity, unit, cost_price, selling_price,
        reorder_level, description, created_at, updated_at
      )
      VALUES (
        ${session.userId}, ${name}, ${category}, ${quantity}, ${unit},
        ${cost_price}, ${selling_price}, ${reorder_level ?? 0},
        ${description ?? null}, NOW(), NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Create inventory error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
