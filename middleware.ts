import { NextResponse, type NextRequest } from "next/server"

const PUBLIC_PATHS = ["/api/auth", "/login", "/register", "/"]
const API_RATE_LIMIT = 60
const RATE_WINDOW_MS = 60_000

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"
  return `rate:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return { allowed: true, remaining: API_RATE_LIMIT - 1 }
  }

  if (entry.count >= API_RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: API_RATE_LIMIT - entry.count }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api/") && !PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const key = getRateLimitKey(request)
    const { allowed, remaining } = checkRateLimit(key)

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Remaining", String(remaining))
    response.headers.set("X-RateLimit-Limit", String(API_RATE_LIMIT))
    return response
  }

  const response = NextResponse.next()
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|public/).*)",
  ],
}
