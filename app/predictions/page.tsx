"use client"

import * as React from "react"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  ChevronDown,
  BarChart3,
  Activity,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface Prediction {
  id: string
  region: string
  disease: string
  risk: "low" | "medium" | "high"
  confidence: number
  trend: "up" | "down" | "stable"
  predictedDate: string
  daysUntil: number
  action: string
  factors: string[]
  historicalAccuracy: number
}

const predictions: Prediction[] = [
  {
    id: "1",
    region: "Northern Plains",
    disease: "Late Blight",
    risk: "high",
    confidence: 87,
    trend: "up",
    predictedDate: "Apr 26, 2026",
    daysUntil: 2,
    action: "Apply fungicide within 48hrs",
    factors: ["High humidity (85%)", "Optimal temperature (18-22°C)", "Recent rainfall"],
    historicalAccuracy: 92,
  },
  {
    id: "2",
    region: "Central Valley",
    disease: "Powdery Mildew",
    risk: "medium",
    confidence: 72,
    trend: "stable",
    predictedDate: "Apr 28, 2026",
    daysUntil: 4,
    action: "Monitor closely, prepare treatment",
    factors: ["Moderate humidity", "Dry conditions expected", "Previous outbreaks"],
    historicalAccuracy: 85,
  },
  {
    id: "3",
    region: "Eastern Hills",
    disease: "Rust",
    risk: "low",
    confidence: 65,
    trend: "down",
    predictedDate: "May 2, 2026",
    daysUntil: 8,
    action: "Continue regular monitoring",
    factors: ["Low humidity", "Unfavorable conditions", "Resistant varieties"],
    historicalAccuracy: 88,
  },
  {
    id: "4",
    region: "Southern Basin",
    disease: "Bacterial Wilt",
    risk: "high",
    confidence: 91,
    trend: "up",
    predictedDate: "Apr 25, 2026",
    daysUntil: 1,
    action: "Isolate affected plants immediately",
    factors: ["Waterlogged soil", "High temperature", "Susceptible crop variety"],
    historicalAccuracy: 94,
  },
  {
    id: "5",
    region: "Western Ridge",
    disease: "Leaf Spot",
    risk: "medium",
    confidence: 68,
    trend: "down",
    predictedDate: "Apr 30, 2026",
    daysUntil: 6,
    action: "Apply preventive measures",
    factors: ["Variable humidity", "Wind patterns", "Crop density"],
    historicalAccuracy: 82,
  },
  {
    id: "6",
    region: "River Delta",
    disease: "Sheath Blight",
    risk: "high",
    confidence: 89,
    trend: "up",
    predictedDate: "Apr 26, 2026",
    daysUntil: 2,
    action: "Reduce nitrogen fertilization, apply fungicide",
    factors: ["High humidity (92%)", "Dense canopy", "Previous infection history"],
    historicalAccuracy: 91,
  },
  {
    id: "7",
    region: "Mountain Foothills",
    disease: "Anthracnose",
    risk: "medium",
    confidence: 74,
    trend: "stable",
    predictedDate: "Apr 29, 2026",
    daysUntil: 5,
    action: "Improve air circulation, monitor",
    factors: ["Moderate rainfall", "Warm nights", "Fruit development stage"],
    historicalAccuracy: 79,
  },
  {
    id: "8",
    region: "Coastal Region",
    disease: "Brown Spot",
    risk: "low",
    confidence: 58,
    trend: "down",
    predictedDate: "May 5, 2026",
    daysUntil: 11,
    action: "Standard monitoring protocol",
    factors: ["Improving conditions", "Wind exposure", "Salt spray"],
    historicalAccuracy: 86,
  },
]

const timeframes = [
  { value: "7d", label: "Next 7 Days" },
  { value: "14d", label: "Next 14 Days" },
  { value: "30d", label: "Next 30 Days" },
]

const diseaseTypes = [
  { value: "all", label: "All Diseases" },
  { value: "fungal", label: "Fungal" },
  { value: "bacterial", label: "Bacterial" },
  { value: "viral", label: "Viral" },
]

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return <TrendingUp className="size-4 text-destructive" />
  }
  if (trend === "down") {
    return <TrendingDown className="size-4 text-success" />
  }
  return <Minus className="size-4 text-muted-foreground" />
}

function RiskBadge({ risk }: { risk: "low" | "medium" | "high" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium",
        risk === "low" && "border-success/50 bg-success/10 text-success",
        risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
        risk === "high" && "border-destructive/50 bg-destructive/10 text-destructive"
      )}
    >
      {risk}
    </Badge>
  )
}

function UrgencyBadge({ days }: { days: number }) {
  if (days <= 2) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3" />
        Urgent
      </Badge>
    )
  }
  if (days <= 5) {
    return (
      <Badge variant="outline" className="gap-1 border-warning/50 bg-warning/10 text-warning-foreground">
        <Clock className="size-3" />
        Soon
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Calendar className="size-3" />
      Scheduled
    </Badge>
  )
}

export default function PredictionsPage() {
  const [timeframe, setTimeframe] = React.useState("7d")
  const [diseaseFilter, setDiseaseFilter] = React.useState("all")
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const stats = {
    total: predictions.length,
    high: predictions.filter((p) => p.risk === "high").length,
    urgent: predictions.filter((p) => p.daysUntil <= 2).length,
    avgConfidence: Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length),
  }

  const sortedPredictions = [...predictions].sort((a, b) => a.daysUntil - b.daysUntil)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Disease Predictions</h1>
            <p className="text-muted-foreground">
              AI-powered disease outbreak forecasts and recommended actions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Predictions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-destructive">{stats.high}</p>
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
                  <p className="text-2xl font-bold text-warning-foreground">{stats.urgent}</p>
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
                  <p className="text-2xl font-bold">{stats.avgConfidence}%</p>
                </div>
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="size-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Performance Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <CardTitle className="text-base">AI Model Performance</CardTitle>
            </div>
            <CardDescription>
              CropGuard prediction model accuracy over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Accuracy</span>
                  <span className="font-medium">89%</span>
                </div>
                <Progress value={89} className="h-2 [&>[data-slot=indicator]]:bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">High Risk Detection</span>
                  <span className="font-medium">94%</span>
                </div>
                <Progress value={94} className="h-2 [&>[data-slot=indicator]]:bg-success" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">False Positive Rate</span>
                  <span className="font-medium">6%</span>
                </div>
                <Progress value={6} className="h-2 [&>[data-slot=indicator]]:bg-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Tabs */}
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
                  {timeframes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diseaseTypes.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {sortedPredictions.map((prediction) => (
                      <Collapsible
                        key={prediction.id}
                        open={expandedId === prediction.id}
                        onOpenChange={(open) => setExpandedId(open ? prediction.id : null)}
                      >
                        <div className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium">{prediction.region}</h3>
                                <RiskBadge risk={prediction.risk} />
                                <UrgencyBadge days={prediction.daysUntil} />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {prediction.disease} - Predicted: {prediction.predictedDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                  <span className="text-sm font-medium">{prediction.confidence}%</span>
                                  <TrendIcon trend={prediction.trend} />
                                </div>
                                <p className="text-xs text-muted-foreground">confidence</p>
                              </div>
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <ChevronDown
                                    className={cn(
                                      "size-4 transition-transform",
                                      expandedId === prediction.id && "rotate-180"
                                    )}
                                  />
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
                                  {prediction.factors.map((factor, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <div className="size-1.5 rounded-full bg-primary" />
                                      {factor}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium">Recommended Action</h4>
                                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                                  <p className="text-sm">{prediction.action}</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="size-4 text-success" />
                                  <span className="text-muted-foreground">
                                    Historical accuracy: {prediction.historicalAccuracy}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <Button size="sm">
                                Take Action
                                <ArrowRight className="ml-2 size-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="ghost" size="sm">
                                Dismiss
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urgent" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sortedPredictions
                    .filter((p) => p.daysUntil <= 2)
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className="p-4 rounded-lg border border-destructive/30 bg-destructive/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="size-4 text-destructive" />
                              <h3 className="font-medium">{prediction.region}</h3>
                              <RiskBadge risk={prediction.risk} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {prediction.disease} - Action required within {prediction.daysUntil * 24} hours
                            </p>
                            <p className="text-sm font-medium mt-2">{prediction.action}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-destructive">{prediction.daysUntil}d</p>
                            <p className="text-xs text-muted-foreground">remaining</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" className="bg-destructive hover:bg-destructive/90">
                            Take Immediate Action
                          </Button>
                          <Button variant="outline" size="sm">
                            Contact Expert
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sortedPredictions
                    .filter((p) => p.daysUntil > 2)
                    .map((prediction) => (
                      <div
                        key={prediction.id}
                        className="p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{prediction.region}</h3>
                              <RiskBadge risk={prediction.risk} />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {prediction.disease} - Predicted: {prediction.predictedDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{prediction.confidence}%</p>
                              <p className="text-xs text-muted-foreground">confidence</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{prediction.daysUntil}d</p>
                              <p className="text-xs text-muted-foreground">until onset</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
