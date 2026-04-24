export type RiskLevel = "low" | "medium" | "high" | "critical"
export type TrendDirection = "up" | "down" | "stable"
export type AlertSeverity = "info" | "warning" | "critical" | "success"
export type AlertCategory = "disease" | "weather" | "system" | "prediction"
export type DiseaseType = "fungal" | "bacterial" | "viral" | "nematode" | "other"
export type UploadStatus = "pending" | "processing" | "completed" | "failed"
export type UserRole = "farmer" | "agronomist" | "researcher" | "admin"

export interface Region {
  id: string
  name: string
  slug: string
  latitude: number
  longitude: number
  areaHa?: number
}

export interface Prediction {
  id: string
  regionId: string
  region: Region
  disease: DiseaseInfo
  riskLevel: RiskLevel
  confidence: number
  trend: TrendDirection
  predictedOnset: string
  validFrom: string
  validTo: string
  factors: string[]
  action: string
  modelVersion: string
  createdAt: string
}

export interface DiseaseInfo {
  id: string
  name: string
  slug: string
  type: DiseaseType
  description?: string
  symptoms?: string
  treatment?: string
}

export interface WeatherSnapshot {
  regionId: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed?: number
  pressure?: number
  recordedAt: string
}

export interface Alert {
  id: string
  regionId?: string
  region?: Region
  severity: AlertSeverity
  category: AlertCategory
  title: string
  message: string
  actionRequired: boolean
  createdAt: string
}

export interface Notification {
  id: string
  alert: Alert
  read: boolean
  readAt?: string
  createdAt: string
}

export interface UploadResult {
  id: string
  fileName: string
  fileUrl: string
  status: UploadStatus
  disease?: string
  confidence?: number
  severity?: string
  analysisResult?: CVAnalysisResult
  createdAt: string
}

export interface CVAnalysisResult {
  disease: string
  confidence: number
  severity: "mild" | "moderate" | "severe"
  recommendations: string[]
  boundingBoxes?: BoundingBox[]
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  label: string
  confidence: number
}

export interface DashboardMetrics {
  activeRiskZones: number
  criticalZones: number
  avgSoilMoisture: number
  avgTemperature: number
  avgHumidity: number
  pendingAlerts: number
  recentPredictions: number
  modelAccuracy: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}
