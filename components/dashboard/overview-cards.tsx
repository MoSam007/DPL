"use client"

import { AlertTriangle, Droplets, Thermometer, Wind } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { DashboardMetrics } from "@/lib/types"

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  variant?: "default" | "warning" | "danger"
}

function MetricCard({ title, value, description, icon, trend, variant = "default" }: MetricCardProps) {
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
                    trend.isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
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

interface OverviewCardsProps {
  metrics?: DashboardMetrics
}

export function OverviewCards({ metrics }: OverviewCardsProps) {
  const cards: MetricCardProps[] = [
    {
      title: "Active Risk Zones",
      value: String(metrics?.activeRiskZones ?? "—"),
      description: `${metrics?.criticalZones ?? 0} critical area${(metrics?.criticalZones ?? 0) !== 1 ? "s" : ""} detected`,
      icon: <AlertTriangle className="size-5" />,
      variant: (metrics?.criticalZones ?? 0) > 0 ? "danger" : "default",
    },
    {
      title: "Avg. Soil Moisture",
      value: metrics ? `${metrics.avgSoilMoisture}%` : "—",
      description: "Optimal range: 40–60%",
      icon: <Droplets className="size-5" />,
      variant: "default",
    },
    {
      title: "Temperature",
      value: metrics ? `${metrics.avgTemperature}°C` : "—",
      description: metrics && metrics.avgTemperature > 30 ? "Above seasonal average" : "Within seasonal range",
      icon: <Thermometer className="size-5" />,
      variant: metrics && metrics.avgTemperature > 30 ? "warning" : "default",
    },
    {
      title: "Humidity",
      value: metrics ? `${metrics.avgHumidity}%` : "—",
      description: metrics && metrics.avgHumidity > 80 ? "High disease risk threshold" : "Moderate humidity",
      icon: <Wind className="size-5" />,
      variant: metrics && metrics.avgHumidity > 80 ? "warning" : "default",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  )
}
