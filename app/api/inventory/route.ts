// app/api/inventory/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

/**
 * GET /api/inventory
 * Fetch inventory items, optionally filtered.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null)
    console.log("[DEBUG] Session (GET):", session)

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const lowStock = searchParams.get("lowStock")

    // Base query
    let query = sql`SELECT * FROM inventory_items`

    // Apply filters dynamically
    if (session?.userId) {
      query = sql`${query} WHERE user_id = ${session.userId}`
    }

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
  } catch (error: any) {
    console.error("[v0] Get inventory error:", error)
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory
 * Create a new inventory item.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession().catch(() => null)
    console.log("[DEBUG] Session (POST):", session)

    const body = await request.json()

    const {
      name = "",
      category = "",
      quantity = 0,
      cost_price = 0,
      selling_price = 0,
      reorder_level = 0,
      description = "",
    } = body

    const safeName = name.trim()
    const safeCategory = category.trim().toUpperCase()
    const safeDescription = description?.trim() || null

    if (!safeName || !safeCategory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    console.log("[DEBUG] Inserting item:", {
      userId: session?.userId ?? null,
      safeName,
      safeCategory,
      quantity,
      cost_price,
      selling_price,
      reorder_level,
    })

    // ✅ No 'unit' column — clean insert
    const result = await sql`
      INSERT INTO inventory_items (
        user_id,
        name,
        category,
        quantity,
        cost_price,
        selling_price,
        reorder_level,
        description,
        created_at,
        updated_at
      )
      VALUES (
        ${session?.userId ?? null},
        ${safeName},
        ${safeCategory},
        ${Number(quantity) || 0},
        ${Number(cost_price) || 0},
        ${Number(selling_price) || 0},
        ${Number(reorder_level) || 0},
        ${safeDescription},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    console.log("[DEBUG] Insert successful:", result[0])
    return NextResponse.json(result[0], { status: 201 })
  } catch (error: any) {
    console.error("[v0] Create inventory error:", error.message || error)
    return NextResponse.json(
      { error: `Server error: ${error.message || "Unknown error"}` },
      { status: 500 }
    )
  }
}
