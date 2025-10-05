import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { createSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const { username, password, storeName } = await request.json()

    if (!username || !password || !storeName) {
      return NextResponse.json({ error: "Username, password, and store name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const result = await createUser(username, password, storeName)

    if (result.error) {
      const statusCode = result.error === "Username already exists" ? 409 : 500
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    if (!result.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    await createSession(result.user.id)

    return NextResponse.json({ user: result.user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "An error occurred during signup" }, { status: 500 })
  }
}
