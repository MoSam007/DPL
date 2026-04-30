import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { MapSection } from "@/components/dashboard/map-section"
import { PredictionsPanel } from "@/components/dashboard/predictions-panel"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { ImageUpload } from "@/components/dashboard/image-upload"
import type { DashboardMetrics } from "@/lib/types"

function baseUrl() {
  return process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
}

async function fetchMetrics(): Promise<DashboardMetrics | null> {
  try {
    const res = await fetch(`${baseUrl()}/api/dashboard`, { cache: "no-store" })
    if (!res.ok) return null
    const body = await res.json()
    return body.success ? (body.data as DashboardMetrics) : null
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  // Only SSR the fast metrics endpoint — predictions/alerts self-fetch client-side
  const metrics = await fetchMetrics()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time crop health monitoring and disease risk predictions
          </p>
        </div>

        <OverviewCards metrics={metrics ?? undefined} />

        <div className="grid gap-6 lg:grid-cols-3">
          <MapSection />
          <div className="space-y-6">
            <PredictionsPanel />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <AlertsSection />
          <ImageUpload />
        </div>
      </div>
    </DashboardLayout>
  )
}
