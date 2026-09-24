import { HttpErrorResponse } from '@angular/common/http';

import { ApiError, ApiFieldError, ServerErrorBody } from './api-error.model';
import {
  CODE_BY_STATUS,
  DEFAULT_ERROR_MESSAGE,
  MESSAGE_BY_STATUS,
  NETWORK_ERROR_MESSAGE,
  SERVER_ERROR_MESSAGE,
} from './error.constants';

/**
 * Normalizes any thrown value into an `ApiError`. Pure and total — never throws
 * — so it is safe to call from interceptors and the global error handler alike.
 */
export function mapHttpError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { code: 'unknown_error', message: DEFAULT_ERROR_MESSAGE, status: 0 };
  }

  if (error.status === 0) {
    return { code: 'network_error', message: NETWORK_ERROR_MESSAGE, status: 0 };
  }

  const body = error.error as ServerErrorBody | string | null;

  if (body && typeof body === 'object') {
    const details = body.errorDetails;
    const detailsMessage = normalizeString(details?.errorMessage);
    const detailsCode = normalizeString(details?.errorCode);

    return {
      code: detailsCode ?? body.code ?? statusToCode(error.status),
      message: detailsMessage ?? body.message ?? statusToMessage(error.status),
      status: error.status,
      fieldErrors: normalizeFieldErrors(body.fieldErrors),
    };
  }

  return {
    code: statusToCode(error.status),
    message: typeof body === 'string' && body.length > 0 ? body : statusToMessage(error.status),
    status: error.status,
  };
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function statusToCode(status: number): string {
  return CODE_BY_STATUS.get(status) ?? (status >= 500 ? 'server_error' : 'request_failed');
}

function statusToMessage(status: number): string {
  return (
    MESSAGE_BY_STATUS.get(status) ?? (status >= 500 ? SERVER_ERROR_MESSAGE : DEFAULT_ERROR_MESSAGE)
  );
}

function normalizeFieldErrors(
  input: ServerErrorBody['fieldErrors']
): readonly ApiFieldError[] | undefined {
  if (!input) {
    return undefined;
  }

  const errors: ApiFieldError[] = Array.isArray(input)
    ? input
        .filter(e => Boolean(e?.field) && Boolean(e?.message))
        .map(e => ({ field: e.field as string, message: e.message as string }))
    : Object.entries(input).map(([field, message]) => ({ field, message }));

  return errors.length > 0 ? errors : undefined;
}
