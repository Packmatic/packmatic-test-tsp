import "@typespec/http";

using TypeSpec.Http;

namespace Notifications;

// ─── Error detail item ──────────────────────────────────────────

model ErrorDetail {
  /** Human readable error message */
  message?: string;

  /** Machine readable error code of what happened */
  errorCode?: string;

  /** Path of where the error occurred */
  path?: string;
}

// ─── Base error body (shared across 401, 403, 500) ──────────────

model ErrorBody {
  #deprecated "Use `status` instead"
  statusCode: int32;
  #deprecated "Use `name` instead"
  message: string;
  #deprecated "Use `name` instead"
  error?: string;

  /** Unique incident identifier */
  incident?: string;

  /** HTTP status code */
  status?: int32;

  /** HTTP status name */
  name?: string;

  /** Path of where the error occurred */
  path?: string;

  /** Detailed error list */
  errors?: ErrorDetail[];
}

// ─── Validation error body (400) ────────────────────────────────

model ValidationErrorBody {
  message: string;
  errors?: string[];
}

// ─── Typed error responses ──────────────────────────────────────

model BadRequest {
  @statusCode statusCode: 400;
  @body body: ValidationErrorBody;
}

model Unauthorized {
  @statusCode statusCode: 401;
  @body body: ErrorBody;
}

model Forbidden {
  @statusCode statusCode: 403;
  @body body: ErrorBody;
}

model ServerError {
  @statusCode statusCode: 500;
  @body body: ErrorBody;
}
