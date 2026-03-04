import type { KyInstance, Options } from "ky";
import type { ApiResponse, Operation, OperationMap, RequestParams } from "./types.js";
import {
  buildHeaders,
  buildQueryParams,
  buildUrlWithPathParams,
  extractResponseHeaders,
  parseResponseBody,
} from "./utils/params.js";
import { resolveResponseStatus } from "./utils/response.js";

/**
 * Creates a type-safe API client from flat operation map
 * Transforms flat operation keys into nested client methods with full type safety
 *
 * @param ky - Ky HTTP client instance for making requests
 * @param operationMap - Runtime operation map with flat keys and HTTP details
 * @returns Nested client object with type-safe method calls
 */
export function createClient<T>(ky: KyInstance, operationMap: OperationMap): T {
  const makeRequest = async (
    { path, method, response }: Operation,
    params?: RequestParams,
    kyOptions?: Options,
  ): Promise<ApiResponse> => {
    const url = buildUrlWithPathParams(path, params);

    const headers = buildHeaders(params);
    const queryParams = kyOptions?.searchParams ?? buildQueryParams(params);
    const options: Options = {
      method: method.toLowerCase() as NonNullable<Options["method"]>,
      throwHttpErrors: false,
      ...kyOptions,
      ...(headers && { headers: { ...headers, ...kyOptions?.headers } }),
      ...(queryParams && { searchParams: queryParams }),
      ...buildBodyOptions(params),
    };

    const kyResponse = await ky(url, options);
    const content = await parseResponseBody(kyResponse);
    const statusCode = resolveResponseStatus(kyResponse, Object.keys(response));

    // Extract headers based on the resolved status code
    const responseMetadata = response[statusCode.toString()];
    const hasDefinedHeaders = responseMetadata?.headers && responseMetadata.headers.length > 0;
    const responseHeaders = hasDefinedHeaders
      ? extractResponseHeaders(kyResponse, responseMetadata.headers) ?? {}
      : undefined;

    return {
      response: {
        statusCode,
        ...(responseHeaders !== undefined && { headers: responseHeaders }),
        content,
      },
      kyResponse,
    };
  };

  const client: Record<string, unknown> = {};

  Object.keys(operationMap).forEach((operationKey) => {
    const operation = operationMap[operationKey];
    if (!operation) return;

    const pathParts = operationKey.split(".");
    let current = client;

    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        current[part] = async (params?: RequestParams, kyOptions?: Options) =>
          makeRequest(operation, params, kyOptions);
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    });
  });

  return client as T;
}

// TODO: derive request content type from the operation map instead of inferring from body type
// see: https://github.com/anthropics/ube-tsp/issues/XXX
function buildBodyOptions(params?: RequestParams): Pick<Options, "body" | "json"> {
  if (!params || params.body === undefined) {
    return {};
  }

  const { body } = params;

  // Binary/stream types — pass as raw body (ky infers content-type)
  if (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof ReadableStream
  ) {
    return { body };
  }

  // Plain objects and arrays — use ky's json option (auto-sets Content-Type: application/json)
  if (typeof body === "object" && body !== null) {
    return { json: body };
  }

  // Strings — pass as raw body (ky defaults to text/plain)
  if (typeof body === "string") {
    return { body };
  }

  // Fallback for other primitives
  return { json: body };
}
