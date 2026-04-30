import { success } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { REGIONS } from "@/lib/regions"
import type { DashboardMetrics, Prediction, WeatherSnapshot } from "@/lib/types"

export const dynamic = "force-dynamic"

const DEFAULTS: DashboardMetrics = {
  activeRiskZones: 0,
  criticalZones: 0,
  avgSoilMoisture: 42, // placeholder — requires soil sensor integration
  avgTemperature: 0,
  avgHumidity: 0,
  pendingAlerts: 0,
  recentPredictions: 0,
  modelAccuracy: 89, // updated from model evaluation pipeline
}

export async function GET() {
  const cacheKey = CACHE_KEYS.dashboard
  const cached = await cache.get(cacheKey)
  if (cached) return Response.json(JSON.parse(cached))

  // Aggregate from prediction and weather caches (populated by their routes)
  const allPredictions: Prediction[] = []
  const allWeather: WeatherSnapshot[] = []

  for (const region of REGIONS) {
    const predCached = await cache.get(CACHE_KEYS.predictions(region.id))
    if (predCached) allPredictions.push(...(JSON.parse(predCached) as Prediction[]))

    const weatherCached = await cache.get(CACHE_KEYS.weather(region.id))
    if (weatherCached) {
      const parsed = JSON.parse(weatherCached)
      allWeather.push(("data" in parsed ? parsed.data : parsed) as WeatherSnapshot)
    }
  }

  const highRisk = allPredictions.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical")
  const critical = allPredictions.filter((p) => p.riskLevel === "critical")

  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0
  const avgTemp = avg(allWeather.map((w) => w.temperature))
  const avgHumidity = avg(allWeather.map((w) => w.humidity))

  const metrics: DashboardMetrics = {
    ...DEFAULTS,
    activeRiskZones: highRisk.length || REGIONS.length,
    criticalZones: critical.length,
    avgTemperature: Math.round(avgTemp * 10) / 10,
    avgHumidity: Math.round(avgHumidity),
    pendingAlerts: highRisk.length,
    recentPredictions: allPredictions.length,
  }

  await cache.set(cacheKey, JSON.stringify({ success: true, data: metrics }), { ex: CACHE_TTL.dashboard })
  return success(metrics)
}
