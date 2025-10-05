"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell, Legend } from "recharts"

interface PaymentData {
  payment_method: string
  transaction_count: number
  total_amount: number
}

interface PaymentChartProps {
  data: PaymentData[]
}

const COLORS = ["hsl(160 84% 39%)", "hsl(173 80% 40%)", "hsl(152 76% 36%)", "hsl(166 72% 42%)"]

export function PaymentChart({ data }: PaymentChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.payment_method.charAt(0).toUpperCase() + item.payment_method.slice(1),
    value: Number(item.total_amount),
    fill: COLORS[index % COLORS.length],
  }))

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Revenue distribution by payment type</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No payment data available</div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Amount",
              },
            }}
            className="h-[300px]"
          >
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
