import type { ApiResponse } from "../types";

function getApiBaseUrl(): string {
  const url = import.meta.env.VITE_API_BASE_URL as string | undefined;

  if (!url) {
    if (import.meta.env.DEV) {
      console.warn("VITE_API_BASE_URL not set, using localhost fallback.");
      return "http://localhost:5000/api";
    }

    throw new Error("VITE_API_BASE_URL environment variable is not set. Check Vercel project settings.");
  }

  return url.trim().replace(/\/+$/, "");
}

const API_BASE_URL = getApiBaseUrl();

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code = "API_ERROR",
    public readonly responsePreview?: string
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

function previewText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 180);
}

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  const responseText = await response.text();

  if (!contentType.toLowerCase().includes("application/json")) {
    const preview = previewText(responseText);
    throw new ApiClientError(
      preview
        ? `Expected a JSON API response but received ${contentType || "an unknown content type"}: ${preview}`
        : `Expected a JSON API response but received ${contentType || "an unknown content type"}.`,
      response.status,
      "NON_JSON_RESPONSE",
      preview
    );
  }

  try {
    return JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    const preview = previewText(responseText);
    throw new ApiClientError("Received invalid JSON from the API.", response.status, "INVALID_JSON_RESPONSE", preview);
  }
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

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body: requestBody
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed.";
    throw new ApiClientError(`Network request failed: ${message}`, 0, "NETWORK_ERROR");
  }

  const payload = await parseApiResponse<T>(response);

  if (!response.ok || !payload.success) {
    const message = payload.success ? response.statusText : payload.error.message;
    const code = payload.success ? "HTTP_ERROR" : payload.error.code;
    throw new ApiClientError(message, response.status, code);
  }

  return payload.data;
}
