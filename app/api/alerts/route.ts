import { NextRequest } from "next/server"
import { alertQuerySchema } from "@/lib/validators"
import { paginated, error, parseSearchParams } from "@/lib/api-utils"
import { cache, CACHE_KEYS } from "@/lib/redis"
import { REGIONS } from "@/lib/regions"
import type { Alert, Prediction, WeatherSnapshot } from "@/lib/types"

export const dynamic = "force-dynamic"

// ---------------------------------------------------------------------------
// Alert generators
// ---------------------------------------------------------------------------

function alertsFromPredictions(predictions: Prediction[]): Alert[] {
  return predictions
    .filter((p) => p.riskLevel === "high" || p.riskLevel === "critical")
    .map((p) => ({
      id: `alert_pred_${p.id}`,
      regionId: p.regionId,
      region: p.region,
      severity: p.riskLevel === "critical" ? ("critical" as const) : ("warning" as const),
      category: "disease" as const,
      title: `${p.disease.name} Risk — ${p.region.name}`,
      message: `${p.riskLevel.charAt(0).toUpperCase() + p.riskLevel.slice(1)} risk detected (${p.confidence}% confidence). ${p.action}`,
      actionRequired: p.riskLevel === "critical",
      createdAt: p.createdAt,
    }))
}

function alertsFromWeather(snapshots: WeatherSnapshot[]): Alert[] {
  const alerts: Alert[] = []

  for (const w of snapshots) {
    const region = REGIONS.find((r) => r.id === w.regionId)

    if (w.humidity > 85) {
      alerts.push({
        id: `alert_weather_humidity_${w.regionId}_${new Date(w.recordedAt).getTime()}`,
        regionId: w.regionId,
        region,
        severity: "warning",
        category: "weather",
        title: `High Humidity — ${region?.name ?? w.regionId}`,
        message: `Humidity at ${w.humidity}% — conditions are favorable for fungal disease development. Increase monitoring frequency.`,
        actionRequired: false,
        createdAt: w.recordedAt,
      })
    }

    if (w.rainfall > 40) {
      alerts.push({
        id: `alert_weather_rain_${w.regionId}_${new Date(w.recordedAt).getTime()}`,
        regionId: w.regionId,
        region,
        severity: w.rainfall > 70 ? ("warning" as const) : ("info" as const),
        category: "weather",
        title: `Heavy Rainfall — ${region?.name ?? w.regionId}`,
        message: `${w.rainfall}mm of rainfall forecasted — monitor for waterlogging, soil saturation, and increased disease pressure.`,
        actionRequired: false,
        createdAt: w.recordedAt,
      })
    }

    if (w.temperature > 33) {
      alerts.push({
        id: `alert_weather_temp_${w.regionId}_${new Date(w.recordedAt).getTime()}`,
        regionId: w.regionId,
        region,
        severity: "info",
        category: "weather",
        title: `High Temperature — ${region?.name ?? w.regionId}`,
        message: `Temperature at ${w.temperature}°C — watch for heat stress and bacterial disease conditions. Ensure adequate irrigation.`,
        actionRequired: false,
        createdAt: w.recordedAt,
      })
    }
  }

  return alerts
}

// ---------------------------------------------------------------------------
// Route
// ---------------------------------------------------------------------------

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, success: 3 }

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request.url)
  const parsed = alertQuerySchema.safeParse(Object.fromEntries(params))

  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid query parameters", 422)
  }

  const { page, pageSize, severity, category, actionRequired } = parsed.data

  // Read predictions and weather from cache (populated by their respective routes)
  const allPredictions: Prediction[] = []
  for (const region of REGIONS) {
    const cached = await cache.get(CACHE_KEYS.predictions(region.id))
    if (cached) allPredictions.push(...(JSON.parse(cached) as Prediction[]))
  }

  const allWeather: WeatherSnapshot[] = []
  for (const region of REGIONS) {
    const cached = await cache.get(CACHE_KEYS.weather(region.id))
    if (cached) {
      const parsed = JSON.parse(cached)
      // Handle both wrapped { success, data } and bare snapshot shapes
      allWeather.push(("data" in parsed ? parsed.data : parsed) as WeatherSnapshot)
    }
  }

  let alerts: Alert[] = [
    ...alertsFromPredictions(allPredictions),
    ...alertsFromWeather(allWeather),
  ]

  // Sort: critical → warning → info → success, then newest first within each tier
  alerts.sort((a, b) => {
    const severityDiff = (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4)
    return severityDiff !== 0
      ? severityDiff
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Apply filters
  if (severity) alerts = alerts.filter((a) => a.severity === severity)
  if (category) alerts = alerts.filter((a) => a.category === category)
  if (actionRequired !== undefined) alerts = alerts.filter((a) => a.actionRequired === actionRequired)

  const total = alerts.length
  const start = (page - 1) * pageSize
  const paged = alerts.slice(start, start + pageSize)

  return paginated(paged, total, page, pageSize)
}
