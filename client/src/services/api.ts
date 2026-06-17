import type { ApiResponse } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "API_ERROR"
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

function buildRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (body instanceof FormData) {
    return body as FormData;
  }

  return JSON.stringify(body);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const requestBody = buildRequestBody(options.body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: requestBody
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    const message = payload.success ? response.statusText : payload.error.message;
    const code = payload.success ? "HTTP_ERROR" : payload.error.code;
    throw new ApiClientError(message, response.status, code);
  }

  return payload.data;
}
