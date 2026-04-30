"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Prediction, RiskLevel, PaginatedResponse } from "@/lib/types"

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize text-[10px] font-semibold px-1.5 py-0",
        risk === "low" && "border-success/50 bg-success/10 text-success",
        risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
        (risk === "high" || risk === "critical") && "border-destructive/50 bg-destructive/10 text-destructive"
      )}
    >
      {risk}
    </Badge>
  )
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="size-3.5 text-destructive" />
  if (trend === "down") return <TrendingDown className="size-3.5 text-success" />
  return <Minus className="size-3.5 text-muted-foreground" />
}

function PredictionSkeleton() {
  return (
    <div className="rounded-xl border p-3.5 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

interface PredictionsPanelProps {
  predictions?: Prediction[]
}

export function PredictionsPanel({ predictions: initialData }: PredictionsPanelProps) {
  const [predictions, setPredictions] = React.useState<Prediction[]>(initialData ?? [])
  const [loading, setLoading] = React.useState(initialData === undefined)

  React.useEffect(() => {
    if (initialData !== undefined) return
    fetch("/api/predictions?pageSize=5&sortBy=risk")
      .then((r) => r.json())
      .then((body) => {
        if (body.success) setPredictions((body.data as PaginatedResponse<Prediction>).data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [initialData])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Predictions</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">AI-powered risk forecasts</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7" asChild>
          <Link href="/predictions">
            View All
            <ArrowRight className="ml-1 size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-3">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <PredictionSkeleton key={i} />)}
            </div>
          ) : predictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <p className="text-sm text-muted-foreground">No predictions yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Visit the{" "}
                <Link href="/predictions" className="text-primary underline underline-offset-2">
                  Predictions
                </Link>{" "}
                page to generate forecasts.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border p-3.5 space-y-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm truncate">{p.region.name}</h4>
                        <TrendIcon trend={p.trend} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.disease.name}</p>
                    </div>
                    <RiskBadge risk={p.riskLevel} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-semibold tabular-nums">{p.confidence}%</span>
                    </div>
                    <Progress
                      value={p.confidence}
                      className={cn(
                        "h-1.5",
                        (p.riskLevel === "high" || p.riskLevel === "critical") && "[&>[data-slot=indicator]]:bg-destructive",
                        p.riskLevel === "medium" && "[&>[data-slot=indicator]]:bg-warning",
                        p.riskLevel === "low" && "[&>[data-slot=indicator]]:bg-success"
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="size-1 rounded-full bg-primary shrink-0" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{p.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
