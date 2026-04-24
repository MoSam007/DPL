"use client"

import * as React from "react"
import {
  Layers,
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  RefreshCw,
  Info,
  ChevronRight,
  Thermometer,
  Droplets,
  Wind,
  Cloud,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RiskZone {
  id: string
  name: string
  risk: "low" | "medium" | "high"
  x: number
  y: number
  size: number
  crop: string
  disease: string
  lastUpdated: string
  temperature: number
  humidity: number
  rainfall: number
}

const riskZones: RiskZone[] = [
  { id: "1", name: "Northern Plains", risk: "high", x: 25, y: 20, size: 80, crop: "Wheat", disease: "Late Blight", lastUpdated: "2 hours ago", temperature: 28, humidity: 85, rainfall: 45 },
  { id: "2", name: "Central Valley", risk: "medium", x: 45, y: 40, size: 100, crop: "Rice", disease: "Powdery Mildew", lastUpdated: "1 hour ago", temperature: 32, humidity: 72, rainfall: 12 },
  { id: "3", name: "Eastern Hills", risk: "low", x: 70, y: 25, size: 60, crop: "Corn", disease: "None Detected", lastUpdated: "30 mins ago", temperature: 26, humidity: 65, rainfall: 8 },
  { id: "4", name: "Southern Basin", risk: "high", x: 35, y: 65, size: 90, crop: "Soybean", disease: "Bacterial Wilt", lastUpdated: "45 mins ago", temperature: 30, humidity: 88, rainfall: 62 },
  { id: "5", name: "Western Ridge", risk: "medium", x: 15, y: 50, size: 70, crop: "Wheat", disease: "Leaf Spot", lastUpdated: "3 hours ago", temperature: 24, humidity: 70, rainfall: 20 },
  { id: "6", name: "Coastal Region", risk: "low", x: 80, y: 55, size: 65, crop: "Rice", disease: "None Detected", lastUpdated: "1 hour ago", temperature: 29, humidity: 78, rainfall: 15 },
  { id: "7", name: "Mountain Foothills", risk: "medium", x: 55, y: 15, size: 55, crop: "Corn", disease: "Rust", lastUpdated: "2 hours ago", temperature: 22, humidity: 68, rainfall: 25 },
  { id: "8", name: "River Delta", risk: "high", x: 60, y: 75, size: 85, crop: "Rice", disease: "Sheath Blight", lastUpdated: "30 mins ago", temperature: 31, humidity: 92, rainfall: 78 },
]

const crops = [
  { value: "all", label: "All Crops" },
  { value: "wheat", label: "Wheat" },
  { value: "rice", label: "Rice" },
  { value: "corn", label: "Corn" },
  { value: "soybean", label: "Soybean" },
]

const regions = [
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
  const [selectedRisk, setSelectedRisk] = React.useState<string[]>(["all"])
  const [selectedZone, setSelectedZone] = React.useState<RiskZone | null>(null)
  const [mapLayer, setMapLayer] = React.useState("risk")
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  const filteredZones = riskZones.filter((zone) => {
    if (selectedRisk.includes("all")) return true
    return selectedRisk.includes(zone.risk)
  })

  const stats = {
    high: riskZones.filter((z) => z.risk === "high").length,
    medium: riskZones.filter((z) => z.risk === "medium").length,
    low: riskZones.filter((z) => z.risk === "low").length,
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
              <Download className="mr-2 size-4" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Zones</p>
                <p className="text-2xl font-bold text-destructive">{stats.high}</p>
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
                <p className="text-2xl font-bold text-warning-foreground">{stats.medium}</p>
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
                <p className="text-2xl font-bold text-success">{stats.low}</p>
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
                <CardDescription>
                  Click on zones to view detailed information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
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
                      <SelectItem key={crop.value} value={crop.value}>
                        {crop.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
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
                      <SelectItem key={layer.value} value={layer.value}>
                        {layer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ToggleGroup
                  type="multiple"
                  value={selectedRisk}
                  onValueChange={(value) => {
                    if (value.length === 0) {
                      setSelectedRisk(["all"])
                    } else if (value.includes("all") && selectedRisk.includes("all")) {
                      setSelectedRisk(value.filter((v) => v !== "all"))
                    } else if (value.includes("all")) {
                      setSelectedRisk(["all"])
                    } else {
                      setSelectedRisk(value)
                    }
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="all" aria-label="All risks" size="sm">
                    All
                  </ToggleGroupItem>
                  <ToggleGroupItem value="low" aria-label="Low risk" size="sm">
                    <div className="size-2 rounded-full bg-success mr-1.5" />
                    Low
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Medium risk" size="sm">
                    <div className="size-2 rounded-full bg-warning mr-1.5" />
                    Medium
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" aria-label="High risk" size="sm">
                    <div className="size-2 rounded-full bg-destructive mr-1.5" />
                    High
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Map Container */}
              <div className="relative aspect-[16/10] rounded-lg border bg-muted/30 overflow-hidden">
                {/* Grid Pattern Background */}
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

                {/* Terrain Base */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />

                {/* Risk Zones */}
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
                          {zone.id}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Map Controls */}
                <div className="absolute right-3 top-3 flex flex-col gap-1">
                  <Button variant="secondary" size="icon" className="size-8">
                    <ZoomIn className="size-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="size-8">
                    <ZoomOut className="size-4" />
                  </Button>
                  <Button variant="secondary" size="icon" className="size-8">
                    <Layers className="size-4" />
                  </Button>
                </div>

                {/* Map Legend */}
                <div className="absolute left-3 bottom-3 flex items-center gap-3 px-3 py-2 bg-background/90 backdrop-blur-sm border rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-success" />
                    <span className="text-xs font-medium">Low</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-warning" />
                    <span className="text-xs font-medium">Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-destructive" />
                    <span className="text-xs font-medium">High</span>
                  </div>
                </div>

                {/* Location Count */}
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
                      <p className="text-sm text-muted-foreground">Zone #{selectedZone.id}</p>
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
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Crop Type</span>
                      <span className="font-medium">{selectedZone.crop}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Disease</span>
                      <span className="font-medium">{selectedZone.disease}</span>
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
            <CardDescription>
              Complete list of zones under surveillance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <div className="grid grid-cols-7 gap-4 p-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b">
                <div>Zone</div>
                <div>Region</div>
                <div>Crop</div>
                <div>Disease</div>
                <div>Risk Level</div>
                <div>Conditions</div>
                <div>Updated</div>
              </div>
              <ScrollArea className="h-[280px]">
                {riskZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={cn(
                      "grid grid-cols-7 gap-4 p-3 text-sm border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors",
                      selectedZone?.id === zone.id && "bg-primary/5"
                    )}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="font-medium">#{zone.id}</div>
                    <div>{zone.name}</div>
                    <div>{zone.crop}</div>
                    <div className="truncate">{zone.disease}</div>
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
                    <div className="text-muted-foreground">{zone.lastUpdated}</div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
