import { success } from "@/lib/api-utils"

export async function GET() {
  return success({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    services: {
      database: "mock",
      cache: "memory",
      ai: "mock",
    },
  })
}
