import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const result = await sql`
      SELECT DISTINCT category 
      FROM inventory_items 
      WHERE user_id = ${session.userId}
      ORDER BY category
    `

    const categories = result.map((row) => row.category)

    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error("[v0] Get categories error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
