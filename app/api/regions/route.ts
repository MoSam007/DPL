import { success } from "@/lib/api-utils"
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/redis"
import { REGIONS } from "@/lib/regions"

export const dynamic = "force-dynamic"

export async function GET() {
  const cached = await cache.get(CACHE_KEYS.regions)
  if (cached) return Response.json(JSON.parse(cached))

  await cache.set(CACHE_KEYS.regions, JSON.stringify({ success: true, data: REGIONS }), { ex: CACHE_TTL.regions })
  return success(REGIONS)
}
