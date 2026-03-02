import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  await request.json().catch(() => null)
  return NextResponse.json(
    { error: "Self-signup is disabled. Please contact your administrator for credentials." },
    { status: 403 },
  )
}
