"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface SalesChartProps {
  data: Array<{ date: string; amount: number }>
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    sales: item.amount,
  }))

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Sales Overview</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Daily sales for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <ChartContainer
          config={{
            sales: {
              label: "Sales",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-[10px] sm:text-xs" tick={{ fontSize: 10 }} />
            <YAxis className="text-[10px] sm:text-xs" tick={{ fontSize: 10 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="sales" stroke="hsl(var(--chart-1))" fill="url(#fillSales)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
