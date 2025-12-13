import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getDashboardStats } from "@/lib/analytics"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const stats = await getDashboardStats(session.userId)

    return NextResponse.json(stats, { status: 200 })
  } catch (error) {
    console.error("[v0] Dashboard stats error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
