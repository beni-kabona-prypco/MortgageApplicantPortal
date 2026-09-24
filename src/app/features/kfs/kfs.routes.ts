import { Routes } from '@angular/router';

export const KFS_ROUTES: Routes = [
  {
    path: '',
    title: 'Key Facts Statement',
    loadComponent: () => import('./kfs-page/kfs-page.component').then(m => m.KfsPageComponent),
  },
];
