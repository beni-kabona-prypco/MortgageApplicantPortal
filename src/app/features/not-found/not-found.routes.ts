import { Routes } from '@angular/router';

export const NOT_FOUND_ROUTES: Routes = [
  {
    path: '',
    title: 'Page Not Found',
    loadComponent: () =>
      import('./not-found-page/not-found-page.component').then(m => m.NotFoundPageComponent),
  },
];
