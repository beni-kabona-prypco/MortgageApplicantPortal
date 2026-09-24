import { Routes } from '@angular/router';

export const CONSENT_ROUTES: Routes = [
  {
    path: '',
    title: 'Consent',
    loadComponent: () =>
      import('./consent-page/consent-page.component').then(m => m.ConsentPageComponent),
  },
];
