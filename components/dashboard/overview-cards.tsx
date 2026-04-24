"use client"

import { AlertTriangle, Droplets, Thermometer, Wind } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "warning" | "danger"
}

function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "card-hover relative overflow-hidden",
        variant === "warning" && "border-warning/40",
        variant === "danger" && "border-destructive/40"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{value}</span>
              {trend && (
                <span
                  className={cn(
                    "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                    trend.isPositive
                      ? "text-success bg-success/10"
                      : "text-destructive bg-destructive/10"
                  )}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div
            className={cn(
              "rounded-xl p-2.5",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "warning" && "bg-warning/15 text-warning-foreground",
              variant === "danger" && "bg-destructive/15 text-destructive"
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const metrics = [
  {
    title: "Active Risk Zones",
    value: "12",
    description: "3 critical areas detected",
    icon: <AlertTriangle className="size-5" />,
    trend: { value: 8, isPositive: false },
    variant: "danger" as const,
  },
  {
    title: "Avg. Soil Moisture",
    value: "42%",
    description: "Optimal range: 40-60%",
    icon: <Droplets className="size-5" />,
    trend: { value: 5, isPositive: true },
    variant: "default" as const,
  },
  {
    title: "Temperature",
    value: "28°C",
    description: "Above seasonal average",
    icon: <Thermometer className="size-5" />,
    trend: { value: 2.5, isPositive: false },
    variant: "warning" as const,
  },
  {
    title: "Humidity",
    value: "78%",
    description: "High disease risk threshold",
    icon: <Wind className="size-5" />,
    trend: { value: 12, isPositive: false },
    variant: "warning" as const,
  },
]

export function OverviewCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  )
}
