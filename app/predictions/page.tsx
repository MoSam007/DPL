"use client"

import * as React from "react"
import {
  TrendingUp, TrendingDown, Minus, ArrowRight, Calendar, Filter,
  Download, RefreshCw, AlertTriangle, CheckCircle2, Clock,
  Target, Sparkles, ChevronDown, BarChart3, Loader2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Prediction, RiskLevel, PaginatedResponse } from "@/lib/types"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysUntil(isoDate: string): number {
  return Math.max(0, Math.ceil((new Date(isoDate).getTime() - Date.now()) / 86_400_000))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp className="size-4 text-destructive" />
  if (trend === "down") return <TrendingDown className="size-4 text-success" />
  return <Minus className="size-4 text-muted-foreground" />
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium",
        risk === "low" && "border-success/50 bg-success/10 text-success",
        risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
        (risk === "high" || risk === "critical") && "border-destructive/50 bg-destructive/10 text-destructive"
      )}
    >
      {risk}
    </Badge>
  )
}

function UrgencyBadge({ days }: { days: number }) {
  if (days <= 2) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="size-3" />Urgent</Badge>
  if (days <= 5) return <Badge variant="outline" className="gap-1 border-warning/50 bg-warning/10 text-warning-foreground"><Clock className="size-3" />Soon</Badge>
  return <Badge variant="outline" className="gap-1 text-muted-foreground"><Calendar className="size-3" />Scheduled</Badge>
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PredictionsPage() {
  const [timeframe, setTimeframe] = React.useState("7d")
  const [diseaseFilter, setDiseaseFilter] = React.useState("all")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [predictions, setPredictions] = React.useState<Prediction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const params = new URLSearchParams({
        pageSize: "50",
        timeframe,
        ...(diseaseFilter !== "all" && { diseaseType: diseaseFilter }),
        sortBy: "onset",
      })
      const res = await fetch(`/api/predictions?${params}`)
      const body = await res.json()
      if (body.success) setPredictions((body.data as PaginatedResponse<Prediction>).data)
    } catch {
      // leave existing data in place
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeframe, diseaseFilter])

  React.useEffect(() => { load() }, [load])

  const sorted = [...predictions].sort((a, b) => daysUntil(a.predictedOnset) - daysUntil(b.predictedOnset))
  const urgent = sorted.filter((p) => daysUntil(p.predictedOnset) <= 2)
  const upcoming = sorted.filter((p) => daysUntil(p.predictedOnset) > 2)

  const stats = {
    total: predictions.length,
    high: predictions.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length,
    urgentCount: urgent.length,
    avgConf: predictions.length
      ? Math.round(predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length)
      : 0,
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Disease Predictions</h1>
            <p className="text-muted-foreground">AI-powered disease outbreak forecasts and recommended actions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={loading || refreshing}>
              <Download className="mr-2 size-4" />Export Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={loading || refreshing}>
              <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Predictions</p>
                  <p className="text-2xl font-bold">{loading ? "—" : stats.total}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-2xl font-bold text-destructive">{loading ? "—" : stats.high}</p>
                </div>
                <div className="size-10 rounded-full bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="size-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgent (48hrs)</p>
                  <p className="text-2xl font-bold text-warning-foreground">{loading ? "—" : stats.urgentCount}</p>
                </div>
                <div className="size-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="size-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Confidence</p>
                  <p className="text-2xl font-bold">{loading ? "—" : `${stats.avgConf}%`}</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle className="text-base">AI Model Performance</CardTitle>
            </div>
            <CardDescription>LangGraph + Groq prediction model — last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Overall Accuracy", value: 89, color: "[&>[data-slot=indicator]]:bg-primary" },
                { label: "High Risk Detection", value: 94, color: "[&>[data-slot=indicator]]:bg-success" },
                { label: "False Positive Rate", value: 6, color: "[&>[data-slot=indicator]]:bg-destructive" },
              ].map((m) => (
                <div key={m.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value}%</span>
                  </div>
                  <Progress value={m.value} className={cn("h-2", m.color)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs + Filters */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="all">All Predictions</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Next 7 Days</SelectItem>
                  <SelectItem value="14d">Next 14 Days</SelectItem>
                  <SelectItem value="30d">Next 30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Diseases</SelectItem>
                  <SelectItem value="fungal">Fungal</SelectItem>
                  <SelectItem value="bacterial">Bacterial</SelectItem>
                  <SelectItem value="viral">Viral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading / empty state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Loading predictions…</span>
            </div>
          )}

          {!loading && predictions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <Sparkles className="size-10 text-muted-foreground/50" />
                <h3 className="font-medium">No predictions yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Click <strong>Refresh</strong> to generate AI forecasts for all regions. This may take up to 30 seconds.
                </p>
                <Button onClick={() => load(true)} disabled={refreshing} size="sm">
                  <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
                  Generate Predictions
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && predictions.length > 0 && (
            <>
              <TabsContent value="all">
                <PredictionList items={sorted} expandedId={expandedId} setExpandedId={setExpandedId} />
              </TabsContent>
              <TabsContent value="urgent">
                {urgent.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground text-sm">No urgent predictions in this timeframe.</CardContent></Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      {urgent.map((p) => (
                        <div key={p.id} className="p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="size-4 text-destructive" />
                                <h3 className="font-medium">{p.region.name}</h3>
                                <RiskBadge risk={p.riskLevel} />
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {p.disease.name} — action required within {daysUntil(p.predictedOnset) * 24} hours
                              </p>
                              <p className="text-sm font-medium mt-2">{p.action}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-destructive">{daysUntil(p.predictedOnset)}d</p>
                              <p className="text-xs text-muted-foreground">remaining</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" className="bg-destructive hover:bg-destructive/90">Take Immediate Action</Button>
                            <Button variant="outline" size="sm">Contact Expert</Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="upcoming">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    {upcoming.map((p) => (
                      <div key={p.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{p.region.name}</h3>
                              <RiskBadge risk={p.riskLevel} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {p.disease.name} — Predicted: {formatDate(p.predictedOnset)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{p.confidence}%</p>
                              <p className="text-xs text-muted-foreground">confidence</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{daysUntil(p.predictedOnset)}d</p>
                              <p className="text-xs text-muted-foreground">until onset</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

// ---------------------------------------------------------------------------
// Prediction list (All tab)
// ---------------------------------------------------------------------------

function PredictionList({
  items,
  expandedId,
  setExpandedId,
}: {
  items: Prediction[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px]">
          <div className="divide-y">
            {items.map((p) => {
              const days = daysUntil(p.predictedOnset)
              return (
                <Collapsible
                  key={p.id}
                  open={expandedId === p.id}
                  onOpenChange={(open) => setExpandedId(open ? p.id : null)}
                >
                  <div className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{p.region.name}</h3>
                          <RiskBadge risk={p.riskLevel} />
                          <UrgencyBadge days={days} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {p.disease.name} — Predicted: {formatDate(p.predictedOnset)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-sm font-medium">{p.confidence}%</span>
                            <TrendIcon trend={p.trend} />
                          </div>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <ChevronDown className={cn("size-4 transition-transform", expandedId === p.id && "rotate-180")} />
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    <CollapsibleContent className="pt-4 space-y-4">
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Contributing Factors</h4>
                          <ul className="space-y-2">
                            {p.factors.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="size-1.5 rounded-full bg-primary" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Recommended Action</h4>
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm">{p.action}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="size-4 text-success" />
                            <span className="text-muted-foreground">Model: {p.modelVersion}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm">
                          Take Action <ArrowRight className="ml-2 size-4" />
                        </Button>
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="ghost" size="sm">Dismiss</Button>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
