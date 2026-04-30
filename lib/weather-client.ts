import type { Region, WeatherSnapshot } from "./types"

const BASE_URL = "https://api.open-meteo.com/v1/forecast"

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
    wind_speed_10m: number
    surface_pressure: number
  }
  daily: {
    precipitation_sum: number[]
  }
}

export async function fetchWeatherForRegion(region: Region): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,surface_pressure",
    daily: "precipitation_sum",
    forecast_days: "2",
    timezone: "auto",
  })

  const res = await fetch(`${BASE_URL}?${params}`, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`Open-Meteo error ${res.status} for ${region.name}`)

  const data: OpenMeteoResponse = await res.json()
  const { current, daily } = data

  // Sum the 2-day forecasted rainfall as a near-term moisture estimate
  const rainfall = daily.precipitation_sum.reduce((sum, v) => sum + v, 0)

  return {
    regionId: region.id,
    temperature: Math.round(current.temperature_2m * 10) / 10,
    humidity: current.relative_humidity_2m,
    rainfall: Math.round(rainfall * 10) / 10,
    windSpeed: Math.round(current.wind_speed_10m),  // already km/h
    pressure: current.surface_pressure,
    recordedAt: new Date().toISOString(),
  }
}

export async function fetchWeatherForRegions(regions: Region[]): Promise<WeatherSnapshot[]> {
  const results = await Promise.allSettled(regions.map(fetchWeatherForRegion))
  return results
    .filter((r): r is PromiseFulfilledResult<WeatherSnapshot> => r.status === "fulfilled")
    .map((r) => r.value)
}
