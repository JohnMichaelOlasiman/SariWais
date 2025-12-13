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

export async function createUser(
  username: string,
  password: string,
  storeName: string,
): Promise<{ user?: User; error?: string }> {
  try {
    if (!username || !password || !storeName) {
      return { error: "All fields are required" }
    }

    const passwordHash = await hashPassword(password)

    const result = await sql`
      INSERT INTO users (username, password_hash, store_name)
      VALUES (${username}, ${passwordHash}, ${storeName})
      RETURNING id, username, store_name, created_at, updated_at
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
      SELECT id, username, password_hash, store_name, created_at, updated_at
      FROM users
      WHERE username = ${username}
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
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
      SELECT id, username, store_name, created_at, updated_at
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
