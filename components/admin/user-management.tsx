"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { User } from "@/lib/types"

type FormState = {
  username: string
  password: string
  storeName: string
  role: "admin" | "user"
  subscriptionDays: string
}

const initialForm: FormState = {
  username: "",
  password: "",
  storeName: "",
  role: "user",
  subscriptionDays: "30",
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState<FormState>(initialForm)

  const loadUsers = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to load users")
        return
      }

      setUsers(data.users || [])
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          storeName: form.storeName,
          role: form.role,
          subscriptionDays: Number(form.subscriptionDays),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create user")
        return
      }

      setForm(initialForm)
      setSuccess(`User ${data.user.username} created successfully.`)
      await loadUsers()
    } catch {
      setError("Failed to create user")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (user: User) => {
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.is_active }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to update user status")
        return
      }

      setUsers((prev) => prev.map((item) => (item.id === data.user.id ? data.user : item)))
    } catch {
      setError("Failed to update user status")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create User Credentials</CardTitle>
          <CardDescription>Only admin can provision user accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={form.storeName}
                onChange={(event) => setForm((prev) => ({ ...prev, storeName: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(value: "admin" | "user") => setForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subscriptionDays">Subscription Days</Label>
              <Input
                id="subscriptionDays"
                type="number"
                min={1}
                value={form.subscriptionDays}
                onChange={(event) => setForm((prev) => ({ ...prev, subscriptionDays: event.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create User"}
              </Button>
              <Button type="button" variant="outline" onClick={loadUsers} disabled={loading}>
                Refresh List
              </Button>
            </div>
          </form>

          {error ? <p className="text-sm text-destructive mt-4">{error}</p> : null}
          {success ? <p className="text-sm text-primary mt-4">{success}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage active subscriptions by enabling or disabling access.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription Ends</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.store_name}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.is_active ? "Active" : "Disabled"}</TableCell>
                    <TableCell>
                      {user.subscription_expires_at
                        ? new Date(user.subscription_expires_at).toLocaleDateString()
                        : "No expiry"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(user)}>
                        {user.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
