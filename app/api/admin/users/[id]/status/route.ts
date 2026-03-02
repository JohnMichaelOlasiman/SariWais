import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/auth"
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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAdmin()
    if ("error" in auth) {
      return auth.error
    }

    const targetUserId = Number(params.id)
    const body = await request.json()
    const isActive = Boolean(body?.isActive)

    if (!Number.isFinite(targetUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    if (targetUserId === auth.currentUser.id) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 })
    }

    const result = await sql`
      UPDATE users
      SET is_active = ${isActive}, updated_at = NOW()
      WHERE id = ${targetUserId}
      RETURNING id, username, store_name, role, is_active, subscription_expires_at, created_at, updated_at
    `

    if (!result.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] }, { status: 200 })
  } catch (error) {
    console.error("[admin/users/:id/status][PATCH]", error)
    return NextResponse.json({ error: "Failed to update user status" }, { status: 500 })
  }
}
