import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createUser, getUserById } from "@/lib/auth"
import { sql } from "@/lib/db"

async function requireAdmin() {
  const session = await getSession()

  if (!session) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) }
  }

  const currentUser = await getUserById(session.userId)

  if (!currentUser || currentUser.role !== "admin") {
    return { error: NextResponse.json({ error: "Admin access required" }, { status: 403 }) }
  }

  return { currentUser }
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return auth.error
    }

    const users = await sql`
      SELECT id, username, store_name, role, is_active, subscription_expires_at, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error("[admin/users][GET]", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return auth.error
    }

    const body = await request.json()
    const username = body?.username?.trim()
    const password = body?.password?.trim()
    const storeName = body?.storeName?.trim()
    const role = body?.role === "admin" ? "admin" : "user"
    const subscriptionDays = Number(body?.subscriptionDays ?? 30)

    if (!username || !password || !storeName) {
      return NextResponse.json({ error: "Username, password, and store name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!Number.isFinite(subscriptionDays) || subscriptionDays < 1) {
      return NextResponse.json({ error: "Subscription days must be at least 1" }, { status: 400 })
    }

    const subscriptionExpiresAt = new Date(Date.now() + subscriptionDays * 24 * 60 * 60 * 1000)

    const result = await createUser(username, password, storeName, {
      role,
      isActive: true,
      subscriptionExpiresAt,
    })

    if (result.error) {
      const statusCode = result.error === "Username already exists" ? 409 : 500
      return NextResponse.json({ error: result.error }, { status: statusCode })
    }

    return NextResponse.json({ user: result.user }, { status: 201 })
  } catch (error) {
    console.error("[admin/users][POST]", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
