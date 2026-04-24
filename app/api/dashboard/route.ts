import { success } from "@/lib/api-utils"
import type { DashboardMetrics } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  // TODO: Replace with real database queries when Prisma is connected
  const metrics: DashboardMetrics = {
    activeRiskZones: 12,
    criticalZones: 3,
    avgSoilMoisture: 42,
    avgTemperature: 28,
    avgHumidity: 78,
    pendingAlerts: 5,
    recentPredictions: 8,
    modelAccuracy: 89,
  }

  return success(metrics)
}
