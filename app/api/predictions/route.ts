import { NextRequest } from "next/server"
import { predictionQuerySchema } from "@/lib/validators"
import { success, error, parseSearchParams } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import type { Prediction } from "@/lib/types"

export const dynamic = "force-dynamic"

const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: "pred_1",
    regionId: "reg_1",
    region: { id: "reg_1", name: "Northern Plains", slug: "northern-plains", latitude: 28.6, longitude: 77.2 },
    disease: { id: "dis_1", name: "Late Blight", slug: "late-blight", type: "fungal" },
    riskLevel: "high",
    confidence: 87,
    trend: "up",
    predictedOnset: "2026-04-26T00:00:00Z",
    validFrom: "2026-04-24T00:00:00Z",
    validTo: "2026-05-01T00:00:00Z",
    factors: ["High humidity (85%)", "Optimal temperature (18-22°C)", "Recent rainfall"],
    action: "Apply fungicide within 48hrs",
    modelVersion: "v2.4.1",
    createdAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "pred_2",
    regionId: "reg_2",
    region: { id: "reg_2", name: "Central Valley", slug: "central-valley", latitude: 26.8, longitude: 75.8 },
    disease: { id: "dis_2", name: "Powdery Mildew", slug: "powdery-mildew", type: "fungal" },
    riskLevel: "medium",
    confidence: 72,
    trend: "stable",
    predictedOnset: "2026-04-28T00:00:00Z",
    validFrom: "2026-04-24T00:00:00Z",
    validTo: "2026-05-04T00:00:00Z",
    factors: ["Moderate humidity", "Dry conditions expected", "Previous outbreaks"],
    action: "Monitor closely, prepare treatment",
    modelVersion: "v2.4.1",
    createdAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "pred_3",
    regionId: "reg_3",
    region: { id: "reg_3", name: "Eastern Hills", slug: "eastern-hills", latitude: 25.4, longitude: 81.8 },
    disease: { id: "dis_3", name: "Rust", slug: "rust", type: "fungal" },
    riskLevel: "low",
    confidence: 65,
    trend: "down",
    predictedOnset: "2026-05-02T00:00:00Z",
    validFrom: "2026-04-24T00:00:00Z",
    validTo: "2026-05-08T00:00:00Z",
    factors: ["Low humidity", "Unfavorable conditions", "Resistant varieties"],
    action: "Continue regular monitoring",
    modelVersion: "v2.4.1",
    createdAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "pred_4",
    regionId: "reg_4",
    region: { id: "reg_4", name: "Southern Basin", slug: "southern-basin", latitude: 13.1, longitude: 80.3 },
    disease: { id: "dis_4", name: "Bacterial Wilt", slug: "bacterial-wilt", type: "bacterial" },
    riskLevel: "high",
    confidence: 91,
    trend: "up",
    predictedOnset: "2026-04-25T00:00:00Z",
    validFrom: "2026-04-24T00:00:00Z",
    validTo: "2026-04-30T00:00:00Z",
    factors: ["Waterlogged soil", "High temperature", "Susceptible crop variety"],
    action: "Isolate affected plants immediately",
    modelVersion: "v2.4.1",
    createdAt: "2026-04-24T10:00:00Z",
  },
  {
    id: "pred_5",
    regionId: "reg_5",
    region: { id: "reg_5", name: "Western Ridge", slug: "western-ridge", latitude: 22.3, longitude: 73.2 },
    disease: { id: "dis_5", name: "Leaf Spot", slug: "leaf-spot", type: "fungal" },
    riskLevel: "medium",
    confidence: 68,
    trend: "down",
    predictedOnset: "2026-04-30T00:00:00Z",
    validFrom: "2026-04-24T00:00:00Z",
    validTo: "2026-05-06T00:00:00Z",
    factors: ["Variable humidity", "Wind patterns", "Crop density"],
    action: "Apply preventive measures",
    modelVersion: "v2.4.1",
    createdAt: "2026-04-24T10:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request.url)
  const parsed = predictionQuerySchema.safeParse(Object.fromEntries(params))

  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid query parameters", 422)
  }

  const { page, pageSize, riskLevel, regionId, timeframe } = parsed.data

  const cacheKey = CACHE_KEYS.predictions(regionId ?? "all")
  const cached = await cache.get(cacheKey)
  if (cached) {
    return Response.json(JSON.parse(cached))
  }

  let filtered = [...MOCK_PREDICTIONS]

  if (riskLevel) {
    filtered = filtered.filter((p) => p.riskLevel === riskLevel)
  }
  if (regionId) {
    filtered = filtered.filter((p) => p.regionId === regionId)
  }

  const now = new Date()
  const days = parseInt(timeframe)
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  filtered = filtered.filter((p) => new Date(p.predictedOnset) <= cutoff)

  filtered.sort((a, b) => new Date(a.predictedOnset).getTime() - new Date(b.predictedOnset).getTime())

  const total = filtered.length
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  const response = {
    success: true,
    data: {
      data: paged,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }

  await cache.set(cacheKey, JSON.stringify(response), { ex: CACHE_TTL.predictions })

  return Response.json(response)
}
