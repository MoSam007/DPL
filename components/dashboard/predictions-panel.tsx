"use client"

import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Prediction {
  id: string
  region: string
  disease: string
  risk: "low" | "medium" | "high"
  confidence: number
  trend: "up" | "down" | "stable"
  action: string
}

const predictions: Prediction[] = [
  {
    id: "1",
    region: "Northern Plains",
    disease: "Late Blight",
    risk: "high",
    confidence: 87,
    trend: "up",
    action: "Apply fungicide within 48hrs",
  },
  {
    id: "2",
    region: "Central Valley",
    disease: "Powdery Mildew",
    risk: "medium",
    confidence: 72,
    trend: "stable",
    action: "Monitor closely, prepare treatment",
  },
  {
    id: "3",
    region: "Eastern Hills",
    disease: "Rust",
    risk: "low",
    confidence: 65,
    trend: "down",
    action: "Continue regular monitoring",
  },
  {
    id: "4",
    region: "Southern Basin",
    disease: "Bacterial Wilt",
    risk: "high",
    confidence: 91,
    trend: "up",
    action: "Isolate affected plants immediately",
  },
  {
    id: "5",
    region: "Western Ridge",
    disease: "Leaf Spot",
    risk: "medium",
    confidence: 68,
    trend: "down",
    action: "Apply preventive measures",
  },
]

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize text-[10px] font-semibold px-1.5 py-0",
        risk === "low" && "border-success/50 bg-success/10 text-success",
        risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
        risk === "high" && "border-destructive/50 bg-destructive/10 text-destructive"
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

export function PredictionsPanel() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Predictions</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            AI-powered risk forecasts
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary text-xs h-7">
          View All
          <ArrowRight className="ml-1 size-3" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-3">
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="rounded-xl border p-3.5 space-y-2.5 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm truncate">{prediction.region}</h4>
                      <TrendIcon trend={prediction.trend} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prediction.disease}
                    </p>
                  </div>
                  <RiskBadge risk={prediction.risk} />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-semibold tabular-nums">{prediction.confidence}%</span>
                  </div>
                  <Progress
                    value={prediction.confidence}
                    className={cn(
                      "h-1.5",
                      prediction.risk === "high" && "[&>[data-slot=indicator]]:bg-destructive",
                      prediction.risk === "medium" && "[&>[data-slot=indicator]]:bg-warning",
                      prediction.risk === "low" && "[&>[data-slot=indicator]]:bg-success"
                    )}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="size-1 rounded-full bg-primary shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {prediction.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
