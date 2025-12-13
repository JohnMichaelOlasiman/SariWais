import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react"
import type { SalesReport } from "@/lib/types"

interface ReportSummaryProps {
  report: SalesReport
}

export function ReportSummary({ report }: ReportSummaryProps) {
  const profitMargin = report.total_sales > 0 ? (report.net_profit / report.total_sales) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{report.total_sales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{report.total_transactions} transactions</p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{report.gross_profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Sales minus COGS</p>
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          <ShoppingCart className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₱{report.net_profit.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{profitMargin.toFixed(1)}% margin</p>
        </CardContent>
      </Card>
    </div>
  )
}
