/** A single field-level validation error returned by the API. */
export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

/**
 * Typed backend error payload nested inside the standard response envelope.
 * When present, `errorMessage` is the user-actionable message composed by the
 * server — the FE surfaces it verbatim rather than a generic status fallback.
 */
export interface ServerErrorDetails {
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

/** Wire shape the backend uses for error response bodies. */
export interface ServerErrorBody {
  readonly code?: string;
  readonly message?: string;
  readonly fieldErrors?:
    | readonly { readonly field?: string; readonly message?: string }[]
    | Readonly<Record<string, string>>;
  readonly errorDetails?: ServerErrorDetails;
}

/**
 * Normalized application error. All HTTP failures are mapped to this shape
 * (see `mapHttpError`) so components and services have one contract to react to
 * instead of raw `HttpErrorResponse`.
 */
export interface ApiError {
  /** Stable machine-readable code, e.g. `validation_failed`. */
  readonly code: string;
  /** Human-readable message, safe to surface to users. */
  readonly message: string;
  /** HTTP status, or `0` for network/client-side failures. */
  readonly status: number;
  /** Per-field validation errors, when the API returns them. */
  readonly fieldErrors?: readonly ApiFieldError[];
}
