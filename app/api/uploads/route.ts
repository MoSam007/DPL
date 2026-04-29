import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-utils"
import type { CVAnalysisResult } from "@/lib/types"

export const dynamic = "force-dynamic"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return error("INVALID_CONTENT_TYPE", "Expected multipart/form-data", 415)
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const cropType = formData.get("cropType") as string | null
    const regionId = formData.get("regionId") as string | null

    if (!file) {
      return error("MISSING_FILE", "No file provided", 400)
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("INVALID_FILE_TYPE", `Allowed types: ${ALLOWED_TYPES.join(", ")}`, 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return error("FILE_TOO_LARGE", "Maximum file size is 10MB", 400)
    }

    if (!cropType) {
      return error("MISSING_FIELD", "cropType is required", 400)
    }

    // TODO: In production, upload to S3 and queue CV analysis job
    // For MVP, return mock analysis result after simulated delay
    const mockResult: CVAnalysisResult = {
      disease: "Powdery Mildew",
      confidence: 89,
      severity: "moderate",
      recommendations: [
        "Apply sulfur-based fungicide within 24 hours",
        "Improve air circulation around plants",
        "Remove heavily infected leaves",
        "Monitor neighboring plants for spread",
      ],
      boundingBoxes: [
        { x: 120, y: 80, width: 200, height: 150, label: "Powdery Mildew", confidence: 0.89 },
      ],
    }

    const uploadId = `upload_${Date.now()}`
    return success({
      id: uploadId,
      fileName: file.name,
      fileUrl: `/uploads/${uploadId}/${file.name}`,
      fileSize: file.size,
      status: "completed",
      cropType,
      regionId,
      analysis: mockResult,
      createdAt: new Date().toISOString(),
    })
  } catch {
    return error("UPLOAD_ERROR", "Failed to process upload", 500)
  }
}
