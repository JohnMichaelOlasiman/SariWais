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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold">{title}</CardTitle>
        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{value}</div>
        {description && <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mt-1 sm:mt-2">{description}</p>}
        {trend && (
          <p
            className={`text-xs sm:text-sm lg:text-base mt-1 sm:mt-2 font-medium ${trend.isPositive ? "text-primary" : "text-destructive"}`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last period
          </p>
        )}
      </CardContent>
    </Card>
  )
}
