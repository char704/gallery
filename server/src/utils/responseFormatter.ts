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
