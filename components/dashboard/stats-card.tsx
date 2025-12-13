import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card className="animate-fade-in hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base lg:text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10">
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl lg:text-4xl font-bold tracking-tight">{value}</div>
        {description && <p className="text-sm lg:text-base text-muted-foreground mt-2">{description}</p>}
        {trend && (
          <p
            className={`text-sm lg:text-base mt-2 font-medium ${trend.isPositive ? "text-primary" : "text-destructive"}`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
