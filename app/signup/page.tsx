import { AuthForm } from "@/components/auth-form"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <AuthForm mode="signup" />
    </div>
  )
}
