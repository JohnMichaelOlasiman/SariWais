// app/api/inventory/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

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

    // validate fields
    if (!name || !category || quantity == null || !unit || cost_price == null || selling_price == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      UPDATE inventory_items
      SET
        name = ${name},
        category = ${category},
        quantity = ${quantity},
        unit = ${unit},
        cost_price = ${cost_price},
        selling_price = ${selling_price},
        reorder_level = ${reorder_level ?? 0},
        description = ${description ?? null},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Item not found or not allowed" }, { status: 404 })
    }

    return NextResponse.json(result[0], { status: 200 })
  } catch (error) {
    console.error("[v0] Update inventory error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const id = Number(params.id)
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 })

    const result = await sql`
      DELETE FROM inventory_items
      WHERE id = ${id} AND user_id = ${session.userId}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Item not found or not allowed" }, { status: 404 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete inventory error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
