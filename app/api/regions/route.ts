import { success } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import type { Region } from "@/lib/types"

export const dynamic = "force-dynamic"

const MOCK_REGIONS: Region[] = [
  { id: "reg_1", name: "Northern Plains", slug: "northern-plains", latitude: 28.6, longitude: 77.2, areaHa: 15000 },
  { id: "reg_2", name: "Central Valley", slug: "central-valley", latitude: 26.8, longitude: 75.8, areaHa: 22000 },
  { id: "reg_3", name: "Eastern Hills", slug: "eastern-hills", latitude: 25.4, longitude: 81.8, areaHa: 8500 },
  { id: "reg_4", name: "Southern Basin", slug: "southern-basin", latitude: 13.1, longitude: 80.3, areaHa: 18000 },
  { id: "reg_5", name: "Western Ridge", slug: "western-ridge", latitude: 22.3, longitude: 73.2, areaHa: 12000 },
  { id: "reg_6", name: "Coastal Region", slug: "coastal-region", latitude: 15.3, longitude: 73.9, areaHa: 9500 },
  { id: "reg_7", name: "Mountain Foothills", slug: "mountain-foothills", latitude: 30.3, longitude: 78.0, areaHa: 6800 },
  { id: "reg_8", name: "River Delta", slug: "river-delta", latitude: 22.6, longitude: 88.4, areaHa: 25000 },
]

export async function GET() {
  const cached = await cache.get(CACHE_KEYS.regions)
  if (cached) {
    return Response.json(JSON.parse(cached))
  }

  const response = { success: true, data: MOCK_REGIONS }
  await cache.set(CACHE_KEYS.regions, JSON.stringify(response), { ex: CACHE_TTL.regions })

  return success(MOCK_REGIONS)
}
