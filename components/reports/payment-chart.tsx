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
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Payment Methods</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Revenue distribution by payment type</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {chartData.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm">No payment data available</div>
        ) : (
          <ChartContainer
            config={{
              value: {
                label: "Amount",
              },
            }}
            className="h-[200px] sm:h-[250px] lg:h-[300px] w-full"
          >
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" label={({ name }) => name}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
