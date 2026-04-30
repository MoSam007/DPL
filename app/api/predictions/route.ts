import { NextRequest } from "next/server"
import { predictionQuerySchema } from "@/lib/validators"
import { paginated, error, parseSearchParams } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { REGIONS } from "@/lib/regions"
import { fetchWeatherForRegion } from "@/lib/weather-client"
import { runPredictionWorkflow } from "@/lib/langgraph/prediction-workflow"
import type { Prediction } from "@/lib/types"

export const dynamic = "force-dynamic"

async function getPredictionsForRegion(regionId: string): Promise<Prediction[]> {
  const cacheKey = CACHE_KEYS.predictions(regionId)
  const cached = await cache.get(cacheKey)
  if (cached) return JSON.parse(cached) as Prediction[]

  const region = REGIONS.find((r) => r.id === regionId)
  if (!region) return []

  try {
    const weather = await fetchWeatherForRegion(region)
    const predictions = await runPredictionWorkflow(region, weather)
    if (predictions.length > 0) {
      await cache.set(cacheKey, JSON.stringify(predictions), { ex: CACHE_TTL.predictions })
    }
    return predictions
  } catch (err) {
    console.error(`[CropGuard] Prediction failed for ${region.name}:`, err)
    return []
  }
}

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request.url)
  const parsed = predictionQuerySchema.safeParse(Object.fromEntries(params))

  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid query parameters", 422)
  }

  const { page, pageSize, riskLevel, regionId, timeframe, sortBy } = parsed.data

  // Determine which regions to fetch predictions for
  const targetIds = regionId ? [regionId] : REGIONS.map((r) => r.id)

  // Fetch all in parallel — each region is independently cached
  const nested = await Promise.all(targetIds.map(getPredictionsForRegion))
  let filtered: Prediction[] = nested.flat()

  // Apply filters
  if (riskLevel) {
    filtered = filtered.filter((p) => p.riskLevel === riskLevel)
  }

  const days = parseInt(timeframe.replace("d", ""), 10)
  const cutoff = new Date(Date.now() + days * 86_400_000)
  filtered = filtered.filter((p) => new Date(p.predictedOnset) <= cutoff)

  // Sort
  if (sortBy === "confidence") {
    filtered.sort((a, b) => b.confidence - a.confidence)
  } else if (sortBy === "risk") {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    filtered.sort((a, b) => (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4))
  } else {
    filtered.sort((a, b) => new Date(a.predictedOnset).getTime() - new Date(b.predictedOnset).getTime())
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return paginated(paged, total, page, pageSize)
}
