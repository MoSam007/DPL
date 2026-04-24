"use client"

import { AlertCircle, AlertTriangle, Info, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type AlertType = "critical" | "warning" | "info"

interface Alert {
  id: string
  title: string
  message: string
  type: AlertType
  timestamp: string
  region: string
}

const alerts: Alert[] = [
  {
    id: "1",
    title: "Critical Disease Outbreak",
    message: "Late blight spreading rapidly in Northern Plains. Immediate action required.",
    type: "critical",
    timestamp: "5 min ago",
    region: "Northern Plains",
  },
  {
    id: "2",
    title: "Weather Alert",
    message: "High humidity (85%) expected for next 48 hours. Increased disease risk.",
    type: "warning",
    timestamp: "32 min ago",
    region: "Central Valley",
  },
  {
    id: "3",
    title: "Prediction Update",
    message: "Risk level decreased for Eastern Hills region based on latest data.",
    type: "info",
    timestamp: "1 hour ago",
    region: "Eastern Hills",
  },
  {
    id: "4",
    title: "Soil Moisture Warning",
    message: "Soil moisture levels below optimal range. Consider irrigation.",
    type: "warning",
    timestamp: "2 hours ago",
    region: "Southern Basin",
  },
  {
    id: "5",
    title: "New Data Available",
    message: "Satellite imagery updated with latest crop health indicators.",
    type: "info",
    timestamp: "3 hours ago",
    region: "All Regions",
  },
]

function AlertIcon({ type }: { type: AlertType }) {
  if (type === "critical") return <AlertCircle className="size-4 text-destructive" />
  if (type === "warning") return <AlertTriangle className="size-4 text-warning" />
  return <Info className="size-4 text-primary" />
}

function AlertCard({ alert }: { alert: Alert }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3.5 space-y-2 transition-colors hover:bg-muted/40 cursor-pointer",
        alert.type === "critical" && "border-l-[3px] border-l-destructive",
        alert.type === "warning" && "border-l-[3px] border-l-warning",
        alert.type === "info" && "border-l-[3px] border-l-primary"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <AlertIcon type={alert.type} />
          <h4 className="font-semibold text-sm truncate">{alert.title}</h4>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
          <Clock className="size-3" />
          {alert.timestamp}
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-6">
        {alert.message}
      </p>
      <div className="flex items-center justify-between pl-6">
        <span className="text-[11px] text-muted-foreground bg-muted/80 px-2 py-0.5 rounded-md font-medium">
          {alert.region}
        </span>
        <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary px-2">
          Details
        </Button>
      </div>
    </div>
  )
}

export function AlertsSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            Active Alerts
            <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {alerts.filter((a) => a.type === "critical").length}
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time notifications
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7">
          View All
          <ArrowRight className="ml-1 size-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-3">
          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
