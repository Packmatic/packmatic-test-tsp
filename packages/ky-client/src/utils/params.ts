import type { KyResponse } from "ky";
import type { RequestParams } from "../types.js";

/**
 * Replaces path parameters in URL template with actual values
 * Trims leading slash for ky compatibility (ky throws error with leading slash)
 */
export function buildUrlWithPathParams(path: string, params?: RequestParams): string {
  let url = path;

  // Replace path parameters if they exist
  if (params?.params?.path) {
    Object.entries(params.params.path).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, String(value));
    });
  }

  // Trim leading slash for ky compatibility (single operation)
  return url.startsWith("/") ? url.slice(1) : url;
}

/**
 * Builds query parameters from params object
 */
export function buildQueryParams(params?: RequestParams): URLSearchParams | undefined {
  if (!params?.params?.query) {
    return undefined;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params.params.query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v != null) {
          searchParams.append(key, String(v));
        }
      });
    } else if (value != null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams;
}

/**
 * Builds headers from params object
 */
export function buildHeaders(params?: RequestParams): Record<string, string> | undefined {
  if (!params?.params?.header) {
    return undefined;
  }

  const headers: Record<string, string> = {};
  Object.entries(params.params.header).forEach(([key, value]) => {
    if (value != null) {
      headers[key] = String(value);
    }
  });
  return Object.keys(headers).length > 0 ? headers : undefined;
}


/**
 * Parses response body based on content-type header
 */
export async function parseResponseBody(response: KyResponse): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.includes("text/")) {
    return response.text();
  }

  return response.body;
}

/**
 * Extracts response headers based on operation metadata
 */
export function extractResponseHeaders(
  response: KyResponse,
  headerNames: string[],
): Record<string, unknown> | undefined {
  if (!headerNames || headerNames.length === 0) {
    return undefined;
  }

  const headers: Record<string, unknown> = {};

  headerNames.forEach((headerName) => {
    const value = response.headers.get(headerName);
    if (value !== null) {
      headers[headerName] = value;
    }
  });

  return Object.keys(headers).length > 0 ? headers : undefined;
}
