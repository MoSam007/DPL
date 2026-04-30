type RedisLike = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, options?: { ex?: number }): Promise<void>
  del(key: string): Promise<void>
}

class MemoryCache implements RedisLike {
  private store = new Map<string, { value: string; expiresAt?: number }>()

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: options?.ex ? Date.now() + options.ex * 1000 : undefined,
    })
  }

  async del(key: string): Promise<void> {
    this.store.delete(key)
  }
}

function createCache(): RedisLike {
  return new MemoryCache()
}

export const cache = createCache()

export const CACHE_KEYS = {
  predictions: (regionId: string) => `predictions:${regionId}`,
  weather: (regionId: string) => `weather:${regionId}`,
  weatherAll: "weather:all",
  dashboard: "dashboard:global",
  regions: "regions:all",
} as const

export const CACHE_TTL = {
  predictions: 300,   // 5 minutes
  weather: 600,       // 10 minutes
  dashboard: 120,     // 2 minutes
  regions: 3600,      // 1 hour
} as const
