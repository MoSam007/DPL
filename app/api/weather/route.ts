import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-utils"
import type { WeatherSnapshot } from "@/lib/types"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"

export const dynamic = "force-dynamic"

const MOCK_WEATHER: Record<string, WeatherSnapshot> = {
  reg_1: { regionId: "reg_1", temperature: 28, humidity: 85, rainfall: 45, windSpeed: 12, pressure: 1013, recordedAt: new Date().toISOString() },
  reg_2: { regionId: "reg_2", temperature: 32, humidity: 72, rainfall: 12, windSpeed: 8, pressure: 1015, recordedAt: new Date().toISOString() },
  reg_3: { regionId: "reg_3", temperature: 26, humidity: 65, rainfall: 8, windSpeed: 15, pressure: 1012, recordedAt: new Date().toISOString() },
  reg_4: { regionId: "reg_4", temperature: 30, humidity: 88, rainfall: 62, windSpeed: 6, pressure: 1010, recordedAt: new Date().toISOString() },
  reg_5: { regionId: "reg_5", temperature: 24, humidity: 70, rainfall: 20, windSpeed: 18, pressure: 1014, recordedAt: new Date().toISOString() },
  reg_6: { regionId: "reg_6", temperature: 29, humidity: 78, rainfall: 15, windSpeed: 22, pressure: 1011, recordedAt: new Date().toISOString() },
  reg_7: { regionId: "reg_7", temperature: 22, humidity: 68, rainfall: 25, windSpeed: 10, pressure: 1016, recordedAt: new Date().toISOString() },
  reg_8: { regionId: "reg_8", temperature: 31, humidity: 92, rainfall: 78, windSpeed: 7, pressure: 1009, recordedAt: new Date().toISOString() },
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const regionId = searchParams.get("regionId")

  if (regionId) {
    const cacheKey = CACHE_KEYS.weather(regionId)
    const cached = await cache.get(cacheKey)
    if (cached) {
      return Response.json(JSON.parse(cached))
    }

    const weather = MOCK_WEATHER[regionId]
    if (!weather) {
      return error("NOT_FOUND", "Region not found", 404)
    }

    await cache.set(cacheKey, JSON.stringify({ success: true, data: weather }), { ex: CACHE_TTL.weather })
    return success(weather)
  }

  return success(Object.values(MOCK_WEATHER))
}
