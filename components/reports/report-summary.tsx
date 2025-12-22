import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react"
import type { SalesReport } from "@/lib/types"

interface ReportSummaryProps {
  report: SalesReport
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const profitMargin = report.total_sales > 0 ? (report.net_profit / report.total_sales) * 100 : 0

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">₱{report.total_sales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{report.total_transactions} transactions</p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Gross Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">₱{report.gross_profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Sales minus COGS</p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in sm:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 sm:pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium">Net Profit</CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">₱{report.net_profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{profitMargin.toFixed(1)}% margin</p>
        </CardContent>
      </Card>
    </div>
  )
}
