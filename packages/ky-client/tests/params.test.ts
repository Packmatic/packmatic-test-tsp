import type { KyResponse } from "ky";
import { describe, expect, it, vi } from "vitest";
import {
  buildHeaders,
  buildQueryParams,
  buildUrlWithPathParams,
  parseResponseBody,
  extractResponseHeaders,
} from "../src/utils/params.js";

describe("buildUrlWithPathParams", () => {
  describe("URL trimming", () => {
    it("trims leading slash from paths", () => {
      expect(buildUrlWithPathParams("/pets/{petId}")).toBe("pets/{petId}");
      expect(buildUrlWithPathParams("/")).toBe("");
    });

    it("preserves paths without leading slash", () => {
      expect(buildUrlWithPathParams("api/test")).toBe("api/test");
      expect(buildUrlWithPathParams("")).toBe("");
    });
  });

  describe("path parameter replacement", () => {
    it("replaces single path parameter", () => {
      const params = { params: { path: { petId: 123 } } };
      expect(buildUrlWithPathParams("/pets/{petId}", params)).toBe("pets/123");
    });

    it("replaces multiple path parameters", () => {
      const params = { params: { path: { userId: 456, petId: 123 } } };
      expect(buildUrlWithPathParams("/users/{userId}/pets/{petId}", params)).toBe("users/456/pets/123");
    });

    it("converts parameter values to strings", () => {
      const params = { params: { path: { petId: 123, active: true } } };
      expect(buildUrlWithPathParams("/pets/{petId}/status/{active}", params)).toBe("pets/123/status/true");
    });
  });

  describe("edge cases", () => {
    it("handles missing params", () => {
      expect(buildUrlWithPathParams("/pets/{petId}")).toBe("pets/{petId}");
      expect(buildUrlWithPathParams("/pets/{petId}", { params: {} })).toBe("pets/{petId}");
    });

    it("works with paths without parameters", () => {
      const params = { params: { path: { id: 456 } } };
      expect(buildUrlWithPathParams("api/items/{id}", params)).toBe("api/items/456");
    });
  });
});

describe("buildQueryParams", () => {
  it("returns undefined when no query params", () => {
    expect(buildQueryParams()).toBeUndefined();
    expect(buildQueryParams({ params: {} })).toBeUndefined();
  });

  it("builds simple query parameters", () => {
    const params = { params: { query: { limit: 10, offset: 0 } } };
    const result = buildQueryParams(params);
    expect(result?.toString()).toBe("limit=10&offset=0");
  });

  it("handles array values", () => {
    const params = { params: { query: { tags: ["red", "blue"] } } };
    const result = buildQueryParams(params);
    expect(result?.toString()).toBe("tags=red&tags=blue");
  });

  it("skips null and undefined values", () => {
    const params = { params: { query: { a: "value", b: null, c: undefined } } };
    const result = buildQueryParams(params);
    expect(result?.toString()).toBe("a=value");
  });

  it("converts values to strings", () => {
    const params = { params: { query: { count: 42, active: true } } };
    const result = buildQueryParams(params);
    expect(result?.toString()).toBe("count=42&active=true");
  });
});

describe("buildHeaders", () => {
  it("returns undefined when no headers", () => {
    expect(buildHeaders()).toBeUndefined();
    expect(buildHeaders({ params: {} })).toBeUndefined();
    expect(
      buildHeaders({
        params: { header: { "X-Null": null, "X-Undefined": undefined } },
      }),
    ).toBeUndefined();
  });

  it("builds headers object", () => {
    const params = {
      params: {
        header: { "Authorization": "Bearer token", "X-Custom": "value" },
      },
    };
    const result = buildHeaders(params);
    expect(result).toEqual({
      "Authorization": "Bearer token",
      "X-Custom": "value",
    });
  });

  it("skips null and undefined values", () => {
    const params = {
      params: {
        header: {
          "Authorization": "Bearer token",
          "X-Null": null,
          "X-Undefined": undefined,
        },
      },
    };
    const result = buildHeaders(params);
    expect(result).toEqual({ Authorization: "Bearer token" });
  });

  it("converts values to strings", () => {
    const params = { params: { header: { "X-Count": 42, "X-Active": true } } };
    const result = buildHeaders(params);
    expect(result).toEqual({ "X-Count": "42", "X-Active": "true" });
  });
});


describe("parseResponseBody", () => {
  const createMockResponse = (contentType: string, body: unknown): KyResponse => {
    const headers = new Headers();
    if (contentType) {
      headers.set("content-type", contentType);
    }

    return {
      headers,
      json: vi.fn().mockResolvedValue(body),
      text: vi.fn().mockResolvedValue(body),
      body: body,
    } as unknown as KyResponse;
  };

  it("should parse JSON content when content-type is application/json", async () => {
    const mockData = { message: "hello" };
    const response = createMockResponse("application/json", mockData);

    const result = await parseResponseBody(response);

    expect(response.json).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it("should parse JSON content when content-type includes application/json with charset", async () => {
    const mockData = { id: 123 };
    const response = createMockResponse("application/json; charset=utf-8", mockData);

    const result = await parseResponseBody(response);

    expect(response.json).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it("should parse text content when content-type is text/plain", async () => {
    const mockText = "Hello, World!";
    const response = createMockResponse("text/plain", mockText);

    const result = await parseResponseBody(response);

    expect(response.text).toHaveBeenCalled();
    expect(result).toBe(mockText);
  });

  it("should parse text content when content-type is text/html", async () => {
    const mockHtml = "<html><body>Hello</body></html>";
    const response = createMockResponse("text/html", mockHtml);

    const result = await parseResponseBody(response);

    expect(response.text).toHaveBeenCalled();
    expect(result).toBe(mockHtml);
  });

  it("should parse text content when content-type includes text/ with charset", async () => {
    const mockText = "Some text content";
    const response = createMockResponse("text/plain; charset=utf-8", mockText);

    const result = await parseResponseBody(response);

    expect(response.text).toHaveBeenCalled();
    expect(result).toBe(mockText);
  });

  it("should return raw body for binary content types", async () => {
    const mockBody = new ArrayBuffer(8);
    const response = createMockResponse("application/octet-stream", mockBody);

    const result = await parseResponseBody(response);

    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
    expect(result).toBe(mockBody);
  });

  it("should return raw body for image content types", async () => {
    const mockBody = new Uint8Array([1, 2, 3, 4]);
    const response = createMockResponse("image/png", mockBody);

    const result = await parseResponseBody(response);

    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
    expect(result).toBe(mockBody);
  });

  it("should return raw body when content-type is missing", async () => {
    const mockBody = "some data";
    const response = createMockResponse("", mockBody);

    const result = await parseResponseBody(response);

    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
    expect(result).toBe(mockBody);
  });

  it("should return raw body for unknown content types", async () => {
    const mockBody = "custom data";
    const response = createMockResponse("application/custom", mockBody);

    const result = await parseResponseBody(response);

    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
    expect(result).toBe(mockBody);
  });
});

describe("extractResponseHeaders", () => {
  const createMockResponseWithHeaders = (headers: Record<string, string>): KyResponse => {
    const headersObj = new Headers(headers);
    return {
      headers: headersObj,
    } as unknown as KyResponse;
  };

  it("should extract specified headers when they exist", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
      "x-custom-header": "custom-value",
      "authorization": "Bearer token",
    });

    const result = extractResponseHeaders(response, ["content-type", "x-custom-header"]);

    expect(result).toEqual({
      "content-type": "application/json",
      "x-custom-header": "custom-value",
    });
  });

  it("should only include headers that exist", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
    });

    const result = extractResponseHeaders(response, ["content-type", "missing-header"]);

    expect(result).toEqual({
      "content-type": "application/json",
    });
  });

  it("should return undefined when no headers match", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
    });

    const result = extractResponseHeaders(response, ["missing-header", "another-missing"]);

    expect(result).toBeUndefined();
  });

  it("should return undefined when headerNames is empty", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
    });

    const result = extractResponseHeaders(response, []);

    expect(result).toBeUndefined();
  });

  it("should handle case-insensitive header names correctly", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
      "x-rate-limit": "100",
    });

    const result = extractResponseHeaders(response, ["Content-Type", "X-Rate-Limit"]);

    // HTTP headers are case-insensitive, so these should match
    expect(result).toEqual({
      "Content-Type": "application/json",
      "X-Rate-Limit": "100",
    });
  });

  it("should handle mixed case header names", () => {
    const response = createMockResponseWithHeaders({
      "authorization": "Bearer token",
      "content-length": "1234",
    });

    const result = extractResponseHeaders(response, ["Authorization", "Content-Length", "ACCEPT"]);

    expect(result).toEqual({
      "Authorization": "Bearer token",
      "Content-Length": "1234",
    });
  });

  it("should extract all headers when all are present", () => {
    const response = createMockResponseWithHeaders({
      "content-type": "application/json",
      "x-rate-limit": "100",
      "etag": "123456",
      "cache-control": "no-cache",
    });

    const result = extractResponseHeaders(response, ["content-type", "x-rate-limit", "etag", "cache-control"]);

    expect(result).toEqual({
      "content-type": "application/json",
      "x-rate-limit": "100",
      "etag": "123456",
      "cache-control": "no-cache",
    });
  });
});
