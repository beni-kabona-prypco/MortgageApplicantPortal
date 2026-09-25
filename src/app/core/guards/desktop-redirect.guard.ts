import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

/** Layout breakpoint at which desktop mode activates — mirrors `@media (width >= 768px)` in SCSS. */
export const LAYOUT_DESKTOP_PX = 768;

export const desktopRedirectGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  if (window.innerWidth < LAYOUT_DESKTOP_PX) {
    return true;
  }

  const router = inject(Router);
  const applicationId = route.paramMap.get('applicationId') ?? '';

  void router.navigate(['/buyer/get-started', applicationId]);

  return false;
};
