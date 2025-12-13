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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
    }

    const result = await sql`
      SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_amount
      FROM transactions
      WHERE user_id = ${session.userId}
        AND transaction_type = 'sale'
        AND created_at >= ${startDate}
        AND created_at <= ${endDate}
        AND payment_method IS NOT NULL
      GROUP BY payment_method
      ORDER BY total_amount DESC
    `

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("[v0] Payment methods error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
