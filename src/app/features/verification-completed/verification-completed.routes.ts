import { Routes } from '@angular/router';

export const VERIFICATION_COMPLETED_ROUTES: Routes = [
  {
    path: '',
    title: 'Verification Completed',
    loadComponent: () =>
      import('./verification-completed-page/verification-completed-page.component').then(
        m => m.VerificationCompletedPageComponent
      ),
  },
];
