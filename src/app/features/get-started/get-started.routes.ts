import { Routes } from '@angular/router';

export const GET_STARTED_ROUTES: Routes = [
  {
    path: '',
    title: 'Get Started',
    loadComponent: () =>
      import('./get-started-page/get-started-page.component').then(m => m.GetStartedPageComponent),
  },
];
