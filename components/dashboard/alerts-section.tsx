"use client"

import Link from "next/link"
import { AlertCircle, AlertTriangle, Info, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Alert, AlertSeverity } from "@/lib/types"

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function AlertIcon({ severity }: { severity: AlertSeverity }) {
  if (severity === "critical") return <AlertCircle className="size-4 text-destructive" />
  if (severity === "warning") return <AlertTriangle className="size-4 text-warning" />
  if (severity === "success") return <CheckCircle2 className="size-4 text-success" />
  return <Info className="size-4 text-primary" />
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 space-y-2 transition-colors hover:bg-muted/40 cursor-pointer",
        alert.severity === "critical" && "border-l-[3px] border-l-destructive",
        alert.severity === "warning" && "border-l-[3px] border-l-warning",
        alert.severity === "info" && "border-l-[3px] border-l-primary",
        alert.severity === "success" && "border-l-[3px] border-l-success"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AlertIcon severity={alert.severity} />
          <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <Clock className="size-3" />
          {relativeTime(alert.createdAt)}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-6 line-clamp-2">
        {alert.message}
      </p>
      {alert.region && (
        <div className="flex items-center justify-between pl-6">
          <span className="text-[11px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md font-medium">
            {alert.region.name}
          </span>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary px-2" asChild>
            <Link href="/alerts">Details</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

interface AlertsSectionProps {
  alerts: Alert[]
}

export function AlertsSection({ alerts }: AlertsSectionProps) {
  const criticalCount = alerts.filter((a) => a.severity === "critical").length

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            Active Alerts
            {criticalCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {criticalCount}
              </span>
            )}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time notifications</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7" asChild>
          <Link href="/alerts">
            View All
            <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-3">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <p className="text-sm text-muted-foreground">No active alerts.</p>
              <p className="text-xs text-muted-foreground mt-1">All clear across monitored regions.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {alerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
