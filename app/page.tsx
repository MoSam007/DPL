import { DashboardLayout } from "@/components/dashboard-layout"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { MapSection } from "@/components/dashboard/map-section"
import { PredictionsPanel } from "@/components/dashboard/predictions-panel"
import { AlertsSection } from "@/components/dashboard/alerts-section"
import { ImageUpload } from "@/components/dashboard/image-upload"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time crop health monitoring and disease risk predictions
          </p>
        </div>

        {/* Overview Metrics */}
        <OverviewCards />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <MapSection />
          <div className="space-y-6">
            <PredictionsPanel />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <AlertsSection />
          <ImageUpload />
        </div>
      </div>
    </DashboardLayout>
  )
}
