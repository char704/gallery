export type UserRole = "USER" | "ADMIN";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface HealthCheckPayload {
  status: "ok";
  uptime: number;
  timestamp: string;
}
