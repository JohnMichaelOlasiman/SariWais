import { getSession } from "@/lib/session"
import { getUserById } from "@/lib/auth"
import { getDashboardStats } from "@/lib/analytics"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { TopItemsTable } from "@/components/dashboard/top-items-table"
import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Package } from "lucide-react"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await getUserById(session.userId)

  if (!user) {
    redirect("/login")
  }

  const stats = await getDashboardStats(session.userId)

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 lg:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-base lg:text-lg text-muted-foreground mt-2">Welcome back, {user.username}!</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Sales"
              value={`₱${stats.totalSales.toFixed(2)}`}
              description="Last 30 days"
              icon={DollarSign}
            />
            <StatsCard
              title="Gross Profit"
              value={`₱${stats.grossProfit.toFixed(2)}`}
              description="Sales minus cost of goods sold"
              icon={TrendingUp}
            />
            <StatsCard
              title="Transactions"
              value={stats.transactionCount.toString()}
              description="Total sales recorded"
              icon={ShoppingCart}
            />
            <StatsCard
              title="Low Stock Items"
              value={stats.lowStockCount.toString()}
              description="Items need reordering"
              icon={AlertTriangle}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SalesChart data={stats.dailySales} />
            <StatsCard
              title="Inventory Value"
              value={`₱${stats.inventoryValue.toFixed(2)}`}
              description="Total value of all items in stock"
              icon={Package}
            />
          </div>

          <TopItemsTable items={stats.topItems} />
        </div>
      </main>
    </SidebarProvider>
  )
}
