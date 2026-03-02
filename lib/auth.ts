import { sql } from "./db"
import type { User } from "./types"
import * as bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function isBcryptHash(value: string): boolean {
  return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")
}

export async function createUser(
  username: string,
  password: string,
  storeName: string,
  options?: {
    role?: "admin" | "user"
    isActive?: boolean
    subscriptionExpiresAt?: Date | null
  },
): Promise<{ user?: User; error?: string }> {
  try {
    if (!username || !password || !storeName) {
      return { error: "All fields are required" }
    }

    const role = options?.role ?? "user"
    const isActive = options?.isActive ?? true
    const subscriptionExpiresAt = options?.subscriptionExpiresAt ?? null

    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (username, password_hash, store_name, role, is_active, subscription_expires_at)
      VALUES (${username}, ${passwordHash}, ${storeName}, ${role}, ${isActive}, ${subscriptionExpiresAt?.toISOString() ?? null})
      RETURNING id, username, store_name, role, is_active, subscription_expires_at, created_at, updated_at
    `

    if (!result || result.length === 0) {
      return { error: "Failed to create user" }
    }

    return { user: result[0] as User }
  } catch (error: any) {
    if (error?.code === "23505") {
      if (error.constraint === "users_username_key") {
        return { error: "Username already exists" }
      }

      if (error.constraint === "users_store_name_unique") {
        return { error: "Store name already exists" }
      }

      return { error: "Duplicate value exists" }
    }

    return { error: "Failed to create user. Please try again." }
  }

}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, username, password_hash, store_name, role, is_active, subscription_expires_at, created_at, updated_at
      FROM users
      WHERE username = ${username}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const storedHash = String(user.password_hash || "")

    let isValid = false
    let passwordNeedsMigration = false

    if (isBcryptHash(storedHash)) {
      isValid = await verifyPassword(password, storedHash)
    } else {
      isValid = password === storedHash
      passwordNeedsMigration = isValid
    }

    if (!isValid) {
      return null
    }

    if (passwordNeedsMigration) {
      try {
        const migratedHash = await hashPassword(password)
        await sql`
          UPDATE users
          SET password_hash = ${migratedHash}, updated_at = NOW()
          WHERE id = ${user.id}
        `
      } catch (migrationError) {
        console.error("[v0] Password hash migration failed:", migrationError)
      }
    }

    if (!user.is_active) {
      return null
    }

    if (user.subscription_expires_at && new Date(user.subscription_expires_at) < new Date()) {
      return null
    }

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("[v0] Error authenticating user:", error)
    return null
  }
}

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, username, store_name, role, is_active, subscription_expires_at, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `
    return result.length > 0 ? (result[0] as User) : null
  } catch (error) {
    console.error("[v0] Error getting user:", error)
    return null
  }
}

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId as number

    return await getUserById(userId)
  } catch (error) {
    console.error("[v0] Error verifying auth:", error)
    return null
  }
}
