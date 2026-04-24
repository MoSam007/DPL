import type { NextRequest } from "next/server"
import type { UserRole } from "./types"

export interface SessionUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  image: string | null
}

export async function getSession(_request: NextRequest): Promise<SessionUser | null> {
  // TODO: Replace with NextAuth getServerSession when auth is configured
  // For MVP, return a mock session
  return {
    id: "user_demo",
    email: "demo@cropguard.ai",
    name: "John Doe",
    role: "agronomist",
    image: null,
  }
}

export function requireRole(user: SessionUser, roles: UserRole[]): boolean {
  return roles.includes(user.role)
}

export function unauthorized() {
  return Response.json(
    { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
    { status: 401 }
  )
}

export function forbidden() {
  return Response.json(
    { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
    { status: 403 }
  )
}
