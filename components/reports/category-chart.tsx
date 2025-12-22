"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface CategoryData {
  category: string
  total_quantity: number
  total_revenue: number
}

interface CategoryChartProps {
  data: CategoryData[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((item) => ({
    category: item.category,
    revenue: Number(item.total_revenue),
  }))

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Sales by Category</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Revenue breakdown by product category</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {chartData.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm">No category data available</div>
        ) : (
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue",
                color: "hsl(160 84% 39%)",
              },
            }}
            className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
          >
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="category" className="text-[10px] sm:text-xs" tick={{ fontSize: 10 }} />
              <YAxis className="text-[10px] sm:text-xs" tick={{ fontSize: 10 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
