import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { LAYOUT_DESKTOP_PX } from '@core/guards';

const ALLOWED_DESKTOP_SEGMENTS = ['get-started', 'verification-completed'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  private readonly router = inject(Router);

  constructor() {
    const mql = globalThis.matchMedia?.(`(width >= ${LAYOUT_DESKTOP_PX}px)`) ?? null;

    mql?.addEventListener('change', event => {
      if (event.matches) {
        this.redirectIfOnRestrictedRoute();
      }
    });
  }

  private redirectIfOnRestrictedRoute(): void {
    const path = this.router.url.split('?')[0];

    if (!path.startsWith('/buyer/')) {
      return;
    }

    const isAllowed = ALLOWED_DESKTOP_SEGMENTS.some(seg => path.includes(`/${seg}/`));

    if (!isAllowed) {
      const segments = path.split('/').filter(Boolean);
      const applicationId = segments.at(-1) ?? '';

      this.router.navigate(['/buyer/get-started', applicationId]);
    }
  }
}
