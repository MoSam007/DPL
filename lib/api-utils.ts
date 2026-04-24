import type { ApiResponse, PaginatedResponse } from "./types"

export function success<T>(data: T): Response {
  const body: ApiResponse<T> = { success: true, data }
  return Response.json(body)
}

export function paginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
): Response {
  const body: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  }
  return Response.json(body)
}

export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, string[]>
): Response {
  return Response.json(
    { success: false, error: { code, message, details } },
    { status }
  )
}

export function validationError(issues: Record<string, string[]>): Response {
  return error("VALIDATION_ERROR", "Invalid request data", 422, issues)
}

export function notFound(resource: string): Response {
  return error("NOT_FOUND", `${resource} not found`, 404)
}

export function parseSearchParams(url: string): URLSearchParams {
  return new URL(url).searchParams
}
