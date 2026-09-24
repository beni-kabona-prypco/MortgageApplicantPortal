import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { API_BASE_URL } from '@core/config';

/**
 * Prepends the runtime `apiBaseUrl` to every request whose URL starts with `/`,
 * so services can use relative paths (e.g. `/buyer/applications/{id}`) without
 * importing the base URL directly. Absolute URLs (https://...) pass through unchanged.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/')) {
    return next(req);
  }

  return next(req.clone({ url: `${inject(API_BASE_URL)}${req.url}` }));
};
