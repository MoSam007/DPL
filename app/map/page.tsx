"use client"

import * as React from "react"
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  RefreshCw,
  Info,
  ChevronRight,
  Thermometer,
  Droplets,
  Cloud,
  Loader2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { Prediction, WeatherSnapshot, PaginatedResponse } from "@/lib/types"

// Fixed visual positions per region (stylised canvas, not geographic)
const REGION_POSITIONS: Record<string, { x: number; y: number; size: number }> = {
  reg_1: { x: 25, y: 20, size: 80 },
  reg_2: { x: 45, y: 40, size: 100 },
  reg_3: { x: 70, y: 25, size: 60 },
  reg_4: { x: 35, y: 65, size: 90 },
  reg_5: { x: 15, y: 50, size: 70 },
  reg_6: { x: 80, y: 55, size: 65 },
  reg_7: { x: 55, y: 15, size: 55 },
  reg_8: { x: 60, y: 75, size: 85 },
}

const RISK_ORDER = { critical: 3, high: 2, medium: 1, low: 0 } as const

type DisplayRisk = "low" | "medium" | "high"

interface RiskZone {
  id: string
  name: string
  risk: DisplayRisk
  x: number
  y: number
  size: number
  disease: string
  lastUpdated: string
  temperature: number
  humidity: number
  rainfall: number
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const crops = [
  { value: "all", label: "All Crops" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" },
]

const regionOptions = [
  { value: "all", label: "All Regions" },
  { value: "north", label: "Northern Zone" },
  { value: "central", label: "Central Zone" },
  { value: "south", label: "Southern Zone" },
  { value: "east", label: "Eastern Zone" },
  { value: "west", label: "Western Zone" },
]

const mapLayers = [
  { value: "risk", label: "Disease Risk" },
  { value: "weather", label: "Weather Overlay" },
  { value: "soil", label: "Soil Moisture" },
  { value: "satellite", label: "Satellite View" },
]

export default function MapInsightsPage() {
  const [zones, setZones] = React.useState<RiskZone[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [selectedRisk, setSelectedRisk] = React.useState<string[]>(["all"])
  const [selectedZone, setSelectedZone] = React.useState<RiskZone | null>(null)
  const [mapLayer, setMapLayer] = React.useState("risk")
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const load = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const [predBody, weatherBody] = await Promise.all([
        fetch("/api/predictions?pageSize=50").then((r) => r.json()),
        fetch("/api/weather").then((r) => r.json()),
      ])

      // Group predictions by region: track highest risk + all disease names
      const byRegion = new Map<string, { name: string; risk: string; diseases: string[] }>()
      if (predBody.success) {
        const predictions = (predBody.data as PaginatedResponse<Prediction>).data
        for (const p of predictions) {
          const existing = byRegion.get(p.regionId)
          if (!existing) {
            byRegion.set(p.regionId, { name: p.region.name, risk: p.riskLevel, diseases: [p.disease.name] })
          } else {
            const newOrder = RISK_ORDER[p.riskLevel as keyof typeof RISK_ORDER] ?? 0
            const curOrder = RISK_ORDER[existing.risk as keyof typeof RISK_ORDER] ?? 0
            if (newOrder > curOrder) existing.risk = p.riskLevel
            if (!existing.diseases.includes(p.disease.name)) existing.diseases.push(p.disease.name)
          }
        }
      }

      // Index weather snapshots by regionId
      const weatherMap = new Map<string, WeatherSnapshot>()
      if (weatherBody.success) {
        const snapshots = weatherBody.data as WeatherSnapshot[]
        for (const w of snapshots) weatherMap.set(w.regionId, w)
      }

      const result: RiskZone[] = Object.entries(REGION_POSITIONS).map(([regionId, pos]) => {
        const pred = byRegion.get(regionId)
        const weather = weatherMap.get(regionId)
        const rawRisk = pred?.risk ?? "low"
        return {
          id: regionId,
          name: pred?.name ?? regionId,
          risk: (rawRisk === "critical" ? "high" : rawRisk) as DisplayRisk,
          ...pos,
          disease: pred?.diseases.join(", ") ?? "No predictions yet",
          lastUpdated: weather ? relativeTime(weather.recordedAt) : "—",
          temperature: weather?.temperature ?? 0,
          humidity: weather?.humidity ?? 0,
          rainfall: weather?.rainfall ?? 0,
        }
      })

      setZones(result)
    } catch {
      // retain previous state on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => { load() }, [load])

  const filteredZones = zones.filter((zone) =>
    selectedRisk.includes("all") || selectedRisk.includes(zone.risk)
  )

  const stats = {
    high: zones.filter((z) => z.risk === "high").length,
    medium: zones.filter((z) => z.risk === "medium").length,
    low: zones.filter((z) => z.risk === "low").length,
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">Map Insights</h1>
            <p className="text-muted-foreground">
              Geographic visualization of disease risk across monitored regions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 size-4" />Export Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={cn("mr-2 size-4", refreshing && "animate-spin")} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Zones</p>
                <p className="text-2xl font-bold text-destructive">{loading ? "—" : stats.high}</p>
              </div>
              <div className="size-10 rounded-full bg-destructive/20 flex items-center justify-center">
                <MapPin className="size-5 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Medium Risk Zones</p>
                <p className="text-2xl font-bold text-warning-foreground">{loading ? "—" : stats.medium}</p>
              </div>
              <div className="size-10 rounded-full bg-warning/20 flex items-center justify-center">
                <MapPin className="size-5 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/20 bg-success/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Low Risk Zones</p>
                <p className="text-2xl font-bold text-success">{loading ? "—" : stats.low}</p>
              </div>
              <div className="size-10 rounded-full bg-success/20 flex items-center justify-center">
                <MapPin className="size-5 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Panel */}
          <Card className={cn("lg:col-span-3", isFullscreen && "fixed inset-4 z-50")}>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle>Disease Risk Heatmap</CardTitle>
                <CardDescription>Click on zones to view detailed information</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                <Maximize2 className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Map Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Crop Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={mapLayer} onValueChange={setMapLayer}>
                  <SelectTrigger className="w-[150px]">
                    <Layers className="mr-2 size-4" />
                    <SelectValue placeholder="Map Layer" />
                  </SelectTrigger>
                  <SelectContent>
                    {mapLayers.map((layer) => (
                      <SelectItem key={layer.value} value={layer.value}>{layer.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="multiple"
                  value={selectedRisk}
                  onValueChange={(value) => {
                    if (value.length === 0) setSelectedRisk(["all"])
                    else if (value.includes("all") && selectedRisk.includes("all")) setSelectedRisk(value.filter((v) => v !== "all"))
                    else if (value.includes("all")) setSelectedRisk(["all"])
                    else setSelectedRisk(value)
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="all" aria-label="All risks" size="sm">All</ToggleGroupItem>
                  <ToggleGroupItem value="low" aria-label="Low risk" size="sm">
                    <div className="size-2 rounded-full bg-success mr-1.5" />Low
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Medium risk" size="sm">
                    <div className="size-2 rounded-full bg-warning mr-1.5" />Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" aria-label="High risk" size="sm">
                    <div className="size-2 rounded-full bg-destructive mr-1.5" />High
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Map Container */}
              <div className="relative aspect-[16/10] rounded-lg border bg-muted/30 overflow-hidden">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, currentColor 1px, transparent 1px),
                      linear-gradient(to bottom, currentColor 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading map data…</span>
                  </div>
                ) : (
                  <div className="absolute inset-4">
                    {filteredZones.map((zone) => (
                      <button
                        key={zone.id}
                        className={cn(
                          "absolute cursor-pointer transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full",
                          selectedZone?.id === zone.id && "ring-2 ring-primary ring-offset-2"
                        )}
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: zone.size,
                          height: zone.size,
                          transform: "translate(-50%, -50%)",
                        }}
                        onClick={() => setSelectedZone(zone)}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 rounded-full opacity-40 blur-md animate-pulse",
                            zone.risk === "low" && "bg-success",
                            zone.risk === "medium" && "bg-warning",
                            zone.risk === "high" && "bg-destructive"
                          )}
                        />
                        <div
                          className={cn(
                            "absolute inset-[20%] rounded-full shadow-lg",
                            zone.risk === "low" && "bg-success",
                            zone.risk === "medium" && "bg-warning",
                            zone.risk === "high" && "bg-destructive"
                          )}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white drop-shadow-md">
                            {zone.id.replace("reg_", "")}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Map Controls */}
                <div className="absolute right-3 top-3 flex flex-col gap-1">
                  <Button variant="secondary" size="icon" className="size-8"><ZoomIn className="size-4" /></Button>
                  <Button variant="secondary" size="icon" className="size-8"><ZoomOut className="size-4" /></Button>
                  <Button variant="secondary" size="icon" className="size-8"><Layers className="size-4" /></Button>
                </div>

                {/* Legend */}
                <div className="absolute left-3 bottom-3 flex items-center gap-3 px-3 py-2 bg-background/90 backdrop-blur-sm border rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5"><div className="size-3 rounded-full bg-success" /><span className="text-xs font-medium">Low</span></div>
                  <div className="flex items-center gap-1.5"><div className="size-3 rounded-full bg-warning" /><span className="text-xs font-medium">Medium</span></div>
                  <div className="flex items-center gap-1.5"><div className="size-3 rounded-full bg-destructive" /><span className="text-xs font-medium">High</span></div>
                </div>

                {/* Zone count */}
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-2 bg-background/90 backdrop-blur-sm border rounded-lg shadow-sm">
                  <MapPin className="size-4 text-primary" />
                  <span className="text-sm font-medium">{filteredZones.length} zones</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zone Details Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Zone Details</CardTitle>
              <CardDescription>
                {selectedZone ? "Selected zone information" : "Click a zone to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedZone.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedZone.id}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        selectedZone.risk === "low" && "border-success/50 bg-success/10 text-success",
                        selectedZone.risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
                        selectedZone.risk === "high" && "border-destructive/50 bg-destructive/10 text-destructive"
                      )}
                    >
                      {selectedZone.risk} risk
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-start justify-between text-sm gap-2">
                      <span className="text-muted-foreground shrink-0">Disease</span>
                      <span className="font-medium text-right">{selectedZone.disease}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="font-medium">{selectedZone.lastUpdated}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Weather Conditions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Thermometer className="size-4 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">Temp</p>
                          <p className="text-sm font-medium">{selectedZone.temperature}°C</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Droplets className="size-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Humidity</p>
                          <p className="text-sm font-medium">{selectedZone.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 col-span-2">
                        <Cloud className="size-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Rainfall (7d)</p>
                          <p className="text-sm font-medium">{selectedZone.rainfall}mm</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    View Full Report
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Info className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select a zone on the map to view detailed information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Zone List */}
        <Card>
          <CardHeader>
            <CardTitle>All Monitored Zones</CardTitle>
            <CardDescription>Complete list of zones under surveillance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="grid grid-cols-6 gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                <div>Zone</div>
                <div>Region</div>
                <div className="col-span-2">Disease</div>
                <div>Risk Level</div>
                <div>Conditions</div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <Loader2 className="size-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading zones…</span>
                </div>
              ) : (
                <ScrollArea className="h-[280px]">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className={cn(
                        "grid grid-cols-6 gap-4 p-3 text-sm border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors",
                        selectedZone?.id === zone.id && "bg-primary/5"
                      )}
                      onClick={() => setSelectedZone(zone)}
                    >
                      <div className="font-medium">{zone.id.replace("reg_", "#")}</div>
                      <div>{zone.name}</div>
                      <div className="col-span-2 truncate">{zone.disease}</div>
                      <div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs",
                            zone.risk === "low" && "border-success/50 bg-success/10 text-success",
                            zone.risk === "medium" && "border-warning/50 bg-warning/10 text-warning-foreground",
                            zone.risk === "high" && "border-destructive/50 bg-destructive/10 text-destructive"
                          )}
                        >
                          {zone.risk}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>{zone.temperature}°C</span>
                        <span>/</span>
                        <span>{zone.humidity}%</span>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
