import { Routes } from '@angular/router';

export const VERIFY_YOUR_IDENTITY_ROUTES: Routes = [
  {
    path: '',
    title: 'Verify Your Identity',
    loadComponent: () =>
      import('./verify-your-identity-page/verify-your-identity-page.component').then(
        m => m.VerifyYourIdentityPageComponent
      ),
  },
];
