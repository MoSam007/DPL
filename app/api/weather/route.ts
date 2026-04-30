import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { REGIONS } from "@/lib/regions"
import { fetchWeatherForRegion, fetchWeatherForRegions } from "@/lib/weather-client"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const regionId = searchParams.get("regionId")

  if (regionId) {
    const cacheKey = CACHE_KEYS.weather(regionId)
    const cached = await cache.get(cacheKey)
    if (cached) return Response.json(JSON.parse(cached))

    const region = REGIONS.find((r) => r.id === regionId)
    if (!region) return error("NOT_FOUND", "Region not found", 404)

    try {
      const weather = await fetchWeatherForRegion(region)
      await cache.set(cacheKey, JSON.stringify({ success: true, data: weather }), { ex: CACHE_TTL.weather })
      return success(weather)
    } catch (err) {
      console.error(`[CropGuard] Weather fetch failed for ${region.name}:`, err)
      return error("WEATHER_ERROR", "Failed to fetch weather data", 502)
    }
  }

  // All regions
  const allKey = CACHE_KEYS.weatherAll
  const cached = await cache.get(allKey)
  if (cached) return Response.json(JSON.parse(cached))

  try {
    const snapshots = await fetchWeatherForRegions(REGIONS)
    await cache.set(allKey, JSON.stringify({ success: true, data: snapshots }), { ex: CACHE_TTL.weather })
    return success(snapshots)
  } catch (err) {
    console.error("[CropGuard] Weather fetch failed for all regions:", err)
    return error("WEATHER_ERROR", "Failed to fetch weather data", 502)
  }
}
