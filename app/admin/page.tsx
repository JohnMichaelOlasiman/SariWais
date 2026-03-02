import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/auth"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { UserManagement } from "@/components/admin/user-management"

export default async function AdminPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await getUserById(session.userId)

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Admin</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">Create and manage user credentials.</p>
            </div>
          </div>

          <UserManagement />
        </div>
      </main>
    </SidebarProvider>
  )
}
