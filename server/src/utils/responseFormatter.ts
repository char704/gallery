import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse, PaginationMeta } from "../types";

export function successResponse<T>(
  data: T,
  message?: string,
  meta?: PaginationMeta
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {})
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: ApiErrorDetail[]
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

export function paginatedSuccessResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  message?: string
): ApiSuccessResponse<T> {
  return successResponse(data, message, paginationMeta(page, limit, total));
}
