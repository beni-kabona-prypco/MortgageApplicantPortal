import { Routes } from '@angular/router';

export const BUYER_DETAILS_ROUTES: Routes = [
  {
    path: '',
    title: 'Your Details',
    loadComponent: () =>
      import('./buyer-details-page/buyer-details-page.component').then(
        m => m.BuyerDetailsPageComponent
      ),
  },
];
