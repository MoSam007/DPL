"use client"

import * as React from "react"
import { Layers, MapPin, ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

interface RiskZone {
  id: string
  name: string
  risk: "low" | "medium" | "high"
  x: number
  y: number
  size: number
}

const riskZones: RiskZone[] = [
  { id: "1", name: "Northern Plains", risk: "high", x: 25, y: 20, size: 80 },
  { id: "2", name: "Central Valley", risk: "medium", x: 45, y: 40, size: 100 },
  { id: "3", name: "Eastern Hills", risk: "low", x: 70, y: 25, size: 60 },
  { id: "4", name: "Southern Basin", risk: "high", x: 35, y: 65, size: 90 },
  { id: "5", name: "Western Ridge", risk: "medium", x: 15, y: 50, size: 70 },
  { id: "6", name: "Coastal Region", risk: "low", x: 80, y: 55, size: 65 },
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
]

export function MapSection() {
  const [selectedRisk, setSelectedRisk] = React.useState<string[]>(["all"])
  const [hoveredZone, setHoveredZone] = React.useState<string | null>(null)

  const filteredZones = riskZones.filter((zone) => {
    if (selectedRisk.includes("all")) return true
    return selectedRisk.includes(zone.risk)
  })

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Disease Risk Heatmap</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time risk visualization across regions
          </p>
        </div>
        <Button variant="outline" size="icon" className="size-8">
          <Maximize2 className="size-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[130px] h-8 text-xs">
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
            <SelectTrigger className="w-[130px] h-8 text-xs">
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
            <ToggleGroupItem value="all" aria-label="All risks" size="sm" className="h-8 text-xs px-2.5">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="low" aria-label="Low risk" size="sm" className="h-8 text-xs px-2.5">
              <div className="size-2 rounded-full bg-success mr-1.5" />
              Low
            </ToggleGroupItem>
            <ToggleGroupItem value="medium" aria-label="Medium risk" size="sm" className="h-8 text-xs px-2.5">
              <div className="size-2 rounded-full bg-warning mr-1.5" />
              Med
            </ToggleGroupItem>
            <ToggleGroupItem value="high" aria-label="High risk" size="sm" className="h-8 text-xs px-2.5">
              <div className="size-2 rounded-full bg-destructive mr-1.5" />
              High
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Map Container */}
        <div className="relative aspect-[16/9] rounded-xl border bg-gradient-to-br from-muted/40 via-background to-muted/40 overflow-hidden">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Terrain gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.06]" />

          {/* Risk Zones */}
          <div className="absolute inset-4">
            {filteredZones.map((zone) => (
              <div
                key={zone.id}
                className="absolute cursor-pointer transition-transform duration-200 hover:scale-110"
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: zone.size,
                  height: zone.size,
                  transform: "translate(-50%, -50%)",
                }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                <div
                  className={cn(
                    "absolute inset-0 rounded-full opacity-30 blur-md",
                    zone.risk === "low" && "bg-success",
                    zone.risk === "medium" && "bg-warning",
                    zone.risk === "high" && "bg-destructive animate-pulse"
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-[25%] rounded-full shadow-sm",
                    zone.risk === "low" && "bg-success",
                    zone.risk === "medium" && "bg-warning",
                    zone.risk === "high" && "bg-destructive"
                  )}
                />
                {hoveredZone === zone.id && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-popover border rounded-lg shadow-lg whitespace-nowrap z-10">
                    <p className="text-xs font-semibold">{zone.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      Risk: {zone.risk}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map Controls */}
          <div className="absolute right-3 top-3 flex flex-col gap-1">
            <Button variant="secondary" size="icon" className="size-7 shadow-sm">
              <ZoomIn className="size-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="size-7 shadow-sm">
              <ZoomOut className="size-3.5" />
            </Button>
            <Button variant="secondary" size="icon" className="size-7 shadow-sm">
              <Layers className="size-3.5" />
            </Button>
          </div>

          {/* Legend */}
          <div className="absolute left-3 bottom-3 flex items-center gap-3 px-3 py-1.5 glass border rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-success" />
              <span className="text-[11px] font-medium">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-warning" />
              <span className="text-[11px] font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-destructive" />
              <span className="text-[11px] font-medium">High</span>
            </div>
          </div>

          {/* Zone count */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1.5 glass border rounded-lg">
            <MapPin className="size-3 text-primary" />
            <span className="text-[11px] font-medium">{filteredZones.length} zones</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
