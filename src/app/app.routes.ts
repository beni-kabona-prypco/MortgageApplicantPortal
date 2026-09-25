import { Routes } from '@angular/router';

import { consentRequiredGuard, desktopRedirectGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('@features/home').then(m => m.HOME_ROUTES),
  },
  {
    path: 'buyer',
    children: [
      {
        path: 'get-started/:applicationId',
        loadChildren: () => import('@features/get-started').then(m => m.GET_STARTED_ROUTES),
      },
      {
        path: 'consent/:applicationId',
        canActivate: [desktopRedirectGuard],
        loadChildren: () => import('@features/consent').then(m => m.CONSENT_ROUTES),
      },
      {
        path: 'buyer-details/:applicationId',
        canActivate: [desktopRedirectGuard, consentRequiredGuard],
        loadChildren: () => import('@features/buyer-details').then(m => m.BUYER_DETAILS_ROUTES),
      },
      {
        path: 'verify-your-identity/:applicationId',
        canActivate: [desktopRedirectGuard],
        loadChildren: () =>
          import('@features/verify-your-identity').then(m => m.VERIFY_YOUR_IDENTITY_ROUTES),
      },
      {
        path: 'verification-completed/:applicationId',
        loadChildren: () =>
          import('@features/verification-completed').then(m => m.VERIFICATION_COMPLETED_ROUTES),
      },
      {
        path: 'kfs/:applicationId',
        canActivate: [desktopRedirectGuard],
        loadChildren: () => import('@features/kfs').then(m => m.KFS_ROUTES),
      },
    ],
  },
  {
    path: 'not-found',
    loadChildren: () => import('@features/not-found').then(m => m.NOT_FOUND_ROUTES),
  },
  { path: '**', redirectTo: 'not-found' },
];
