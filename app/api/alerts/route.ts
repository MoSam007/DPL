import { NextRequest } from "next/server"
import { alertQuerySchema } from "@/lib/validators"
import { success, error, parseSearchParams } from "@/lib/api-utils"
import type { Alert } from "@/lib/types"

export const dynamic = "force-dynamic"

const MOCK_ALERTS: Alert[] = [
  {
    id: "alert_1",
    regionId: "reg_1",
    region: { id: "reg_1", name: "Northern Plains", slug: "northern-plains", latitude: 28.6, longitude: 77.2 },
    severity: "critical",
    category: "disease",
    title: "Late Blight Outbreak Detected",
    message: "High confidence detection in Northern Plains. Immediate fungicide application recommended within 24 hours.",
    actionRequired: true,
    createdAt: "2026-04-24T09:50:00Z",
  },
  {
    id: "alert_2",
    regionId: "reg_4",
    region: { id: "reg_4", name: "Southern Basin", slug: "southern-basin", latitude: 13.1, longitude: 80.3 },
    severity: "critical",
    category: "disease",
    title: "Bacterial Wilt Spreading",
    message: "Rapid spread detected in Southern Basin. Isolate affected plants and implement containment measures.",
    actionRequired: true,
    createdAt: "2026-04-24T09:35:00Z",
  },
  {
    id: "alert_3",
    regionId: "reg_6",
    severity: "warning",
    category: "weather",
    title: "High Humidity Alert",
    message: "Humidity levels exceeding 85% in River Delta region. Favorable conditions for fungal diseases.",
    actionRequired: false,
    createdAt: "2026-04-24T09:00:00Z",
  },
  {
    id: "alert_4",
    regionId: "reg_2",
    region: { id: "reg_2", name: "Central Valley", slug: "central-valley", latitude: 26.8, longitude: 75.8 },
    severity: "warning",
    category: "disease",
    title: "Powdery Mildew Risk Elevated",
    message: "Conditions favorable for powdery mildew development in Central Valley. Monitor closely.",
    actionRequired: false,
    createdAt: "2026-04-24T08:00:00Z",
  },
  {
    id: "alert_5",
    severity: "info",
    category: "system",
    title: "Scheduled Drone Survey",
    message: "Automated drone survey scheduled for Western Ridge tomorrow at 06:00 AM.",
    actionRequired: false,
    createdAt: "2026-04-24T07:00:00Z",
  },
  {
    id: "alert_6",
    regionId: "reg_3",
    region: { id: "reg_3", name: "Eastern Hills", slug: "eastern-hills", latitude: 25.4, longitude: 81.8 },
    severity: "success",
    category: "disease",
    title: "Disease Contained Successfully",
    message: "Rust outbreak in Eastern Hills has been successfully contained following treatment.",
    actionRequired: false,
    createdAt: "2026-04-24T05:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  const params = parseSearchParams(request.url)
  const parsed = alertQuerySchema.safeParse(Object.fromEntries(params))

  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid query parameters", 422)
  }

  const { page, pageSize, severity, category, actionRequired } = parsed.data

  let filtered = [...MOCK_ALERTS]

  if (severity) {
    filtered = filtered.filter((a) => a.severity === severity)
  }
  if (category) {
    filtered = filtered.filter((a) => a.category === category)
  }
  if (actionRequired !== undefined) {
    filtered = filtered.filter((a) => a.actionRequired === actionRequired)
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return success({
    data: paged,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}
