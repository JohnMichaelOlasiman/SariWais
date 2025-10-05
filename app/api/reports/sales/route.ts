import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getSalesReport } from "@/lib/analytics"

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

    const report = await getSalesReport(session.userId, new Date(startDate), new Date(endDate))

    return NextResponse.json(report, { status: 200 })
  } catch (error) {
    console.error("[v0] Sales report error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
