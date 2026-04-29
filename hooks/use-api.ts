"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type {
  DashboardMetrics,
  Prediction,
  Alert,
  Region,
  WeatherSnapshot,
  PaginatedResponse,
} from "@/lib/types"

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useFetch<T>(url: string, options?: { enabled?: boolean }): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null })
  const enabled = options?.enabled ?? true
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (!controller.signal.aborted) {
        setState({ data: json.data ?? json, loading: false, error: null })
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setState((prev) => ({ ...prev, loading: false, error: err.message }))
      }
    }
  }, [url, enabled])

  useEffect(() => {
    fetchData()
    return () => abortRef.current?.abort()
  }, [fetchData])

  return { ...state, refetch: fetchData }
}

export function useDashboard() {
  return useFetch<DashboardMetrics>("/api/dashboard")
}

export function usePredictions(params?: {
  riskLevel?: string
  timeframe?: string
  page?: number
  pageSize?: number
}) {
  const query = new URLSearchParams()
  if (params?.riskLevel && params.riskLevel !== "all") query.set("riskLevel", params.riskLevel)
  if (params?.timeframe) query.set("timeframe", params.timeframe)
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("pageSize", String(params.pageSize))
  const qs = query.toString()
  return useFetch<PaginatedResponse<Prediction>>(`/api/predictions${qs ? `?${qs}` : ""}`)
}

export function useAlerts(params?: {
  severity?: string
  category?: string
  page?: number
  pageSize?: number
}) {
  const query = new URLSearchParams()
  if (params?.severity && params.severity !== "all") query.set("severity", params.severity)
  if (params?.category) query.set("category", params.category)
  if (params?.page) query.set("page", String(params.page))
  if (params?.pageSize) query.set("pageSize", String(params.pageSize))
  const qs = query.toString()
  return useFetch<PaginatedResponse<Alert>>(`/api/alerts${qs ? `?${qs}` : ""}`)
}

export function useRegions() {
  return useFetch<Region[]>("/api/regions")
}

export function useWeather(regionId?: string) {
  const url = regionId ? `/api/weather?regionId=${regionId}` : "/api/weather"
  return useFetch<WeatherSnapshot | WeatherSnapshot[]>(url)
}

export function useUploadImage() {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: unknown | null
  }>({ loading: false, error: null, data: null })

  const upload = useCallback(async (file: File, cropType: string, regionId: string, notes?: string) => {
    setState({ loading: true, error: null, data: null })
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("cropType", cropType)
      formData.append("regionId", regionId)
      if (notes) formData.append("notes", notes)

      const res = await fetch("/api/uploads", { method: "POST", body: formData })
      if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
      const json = await res.json()
      setState({ loading: false, error: null, data: json.data })
      return json.data
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setState({ loading: false, error: message, data: null })
      throw err
    }
  }, [])

  return { ...state, upload }
}
