import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiError } from '@core/error';
import { mapHttpError } from '@core/error';
import { NotificationService } from '@core/notifications';

/**
 * Funnels every HTTP error through `mapHttpError` → typed `ApiError`, surfaces a
 * toast for unexpected failures, and rethrows the `ApiError` so the caller can
 * react (inline error state, retry, etc.).
 *
 * Silent cases (no toast):
 *  - 422: rendered as inline form field errors by the caller.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = mapHttpError(error);

      if (apiError.status !== 422) {
        notifications.error({ message: apiError.message });
      }

      return throwError((): ApiError => apiError);
    })
  );
};
