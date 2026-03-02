"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Store } from "lucide-react"

interface AuthFormProps {
  mode: "login"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const endpoint = "/api/auth/login"
      const body = { username, password }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        setLoading(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md animate-fade-in-up mx-4 sm:mx-0">
      <CardHeader className="space-y-1 p-4 sm:p-6">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10">
            <Store className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl sm:text-2xl text-center">
          Welcome back
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-center">
          Enter your credentials to access your store
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="username" className="text-xs sm:text-sm">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-10 sm:h-11 text-sm"
            />
          </div>
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 sm:h-11 text-sm"
            />
          </div>
          {error && (
            <div className="p-2 sm:p-3 text-xs sm:text-sm text-destructive bg-destructive/10 rounded-md animate-fade-in">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 sm:space-y-4 pt-4 sm:pt-6 p-4 sm:p-6">
          <Button type="submit" className="w-full h-10 sm:h-11 text-sm" disabled={loading}>
            {loading ? "Please wait..." : "Sign In"}
          </Button>
          <p className="text-xs sm:text-sm text-center text-muted-foreground">
            Credentials are provided by your administrator.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
