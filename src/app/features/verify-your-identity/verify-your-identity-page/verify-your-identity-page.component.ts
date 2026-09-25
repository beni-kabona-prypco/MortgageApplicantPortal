import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, TextComponent } from '@prypco/web-ui';
import { map, take } from 'rxjs/operators';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { PageCardComponent } from '@shared/ui/page-card';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import { VERIFY_YOUR_IDENTITY_EVENTS } from '../verify-your-identity.constants';
import type { VerifyYourIdentityApplicationRecord } from '../verify-your-identity.model';
import { VerifyYourIdentityService } from '../verify-your-identity.service';

@Component({
  selector: 'app-verify-your-identity-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    PageCardComponent,
    ButtonComponent,
    TextComponent,
  ],
  templateUrl: './verify-your-identity-page.component.html',
  styleUrl: './verify-your-identity-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyYourIdentityPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(VerifyYourIdentityService);
  private readonly amplitude = inject(AMPLITUDE_SDK);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── API state ──────────────────────────────────────────────────────────────

  protected readonly isLoading = signal(true);
  protected readonly hasError = signal(false);
  private readonly appData = signal<VerifyYourIdentityApplicationRecord | null>(null);
  private readonly eKycUrl = signal('');

  // ── Derived nav data ───────────────────────────────────────────────────────

  protected readonly brokerName = computed(() => this.appData()?.applicationData.broker.name ?? '');
  protected readonly brokerageName = computed(
    () => this.appData()?.applicationData.brokerage.name.trim() ?? ''
  );
  protected readonly brokerageLogo = computed(
    () => this.appData()?.applicationData.brokerage.logo ?? ''
  );
  protected readonly shortId = computed(() => this.appData()?.applicationData.short_id ?? '');

  // ── Redirect state ─────────────────────────────────────────────────────────

  protected readonly isRedirecting = signal(false);

  constructor() {
    const appId = this.applicationId();

    if (appId) {
      this.service
        .getApplication(appId)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            if (!res.success || !res.data) {
              this.router.navigate(['/not-found'], { replaceUrl: true });

              return;
            }

            this.appData.set(res.data);
            this.isLoading.set(false);

            const url = res.data.applicationData.links?.eKyc?.redirectUrl ?? '';

            if (!url) {
              this.hasError.set(true);

              return;
            }

            this.eKycUrl.set(url);
            this.amplitude.track(VERIFY_YOUR_IDENTITY_EVENTS.PAGE_VIEWED, {
              applicationId: res.data.applicationData.id,
            });
          },
          error: () => {
            this.router.navigate(['/not-found'], { replaceUrl: true });
          },
        });
    }
  }

  protected startVerification(): void {
    const url = this.eKycUrl();

    if (!url || this.isRedirecting()) {
      return;
    }

    this.amplitude.track(VERIFY_YOUR_IDENTITY_EVENTS.EKYC_REDIRECT, {
      applicationId: this.applicationId(),
    });
    this.isRedirecting.set(true);
    this.navigateExternal(url);
  }

  // Wrapped for testability
  protected navigateExternal(url: string): void {
    window.location.href = url;
  }
}
