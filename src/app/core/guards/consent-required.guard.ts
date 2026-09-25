import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { ConsentStateService } from '@core/consent';

export const consentRequiredGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const consentState = inject(ConsentStateService);
  const applicationId = route.paramMap.get('applicationId') ?? '';

  if (consentState.isApproved(applicationId)) {
    return true;
  }

  const router = inject(Router);

  void router.navigate(['/buyer/get-started', applicationId]);

  return false;
};
