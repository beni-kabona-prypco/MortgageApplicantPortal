import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TextComponent } from '@prypco/web-ui';
import { QRCodeComponent } from 'angularx-qrcode';
import { timer } from 'rxjs';
import { map, switchMap, take, takeWhile } from 'rxjs/operators';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { ConsentStateService } from '@core/consent';
import { ViewportService } from '@core/viewport';
import { PageCardComponent } from '@shared/ui/page-card';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import { APPRO_STATUS, TERMINAL_STATUSES } from '@core/application';
import { GET_STARTED_EVENTS, POLL_INTERVAL_MS } from '../get-started.constants';
import { GetStartedMobileComponent } from '../get-started-mobile/get-started-mobile.component';
import { GetStartedService } from '../get-started.service';
import type { ApplicationRecord } from '../get-started.model';

@Component({
  selector: 'app-get-started-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    PageCardComponent,
    QRCodeComponent,
    TextComponent,
    GetStartedMobileComponent,
  ],
  templateUrl: './get-started-page.component.html',
  styleUrl: './get-started-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetStartedPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(GetStartedService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly amplitude = inject(AMPLITUDE_SDK);
  private readonly consentState = inject(ConsentStateService);
  protected readonly viewport = inject(ViewportService);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── API state ──────────────────────────────────────────────────────────────

  protected readonly isLoading = signal(true);
  protected readonly appData = signal<ApplicationRecord | null>(null);
  protected readonly isVerificationDetected = signal(false);

  // ── Derived state ──────────────────────────────────────────────────────────

  protected readonly buyerFirstName = computed(
    () => this.appData()?.applicationData.applicants?.[0]?.firstName ?? ''
  );

  protected readonly shortId = computed(() => this.appData()?.applicationData.short_id ?? '');

  protected readonly brokerName = computed(
    () => this.appData()?.applicationData.broker?.name ?? ''
  );

  protected readonly brokerageName = computed(
    () => this.appData()?.applicationData.brokerage?.name.trim() ?? ''
  );

  protected readonly brokerageLogo = computed(
    () => this.appData()?.applicationData.brokerage?.logo ?? ''
  );

  protected readonly isConsentAccepted = computed(() => !!this.appData()?.applicationData.consents);

  protected readonly isAdditionalInfoProvided = computed(() => {
    const data = this.appData()?.applicationData;

    if (!data) {
      return false;
    }

    const { status } = data;
    const businessEmail = data.applicants?.[0]?.businessEmail;

    return (
      ([APPRO_STATUS.LEAD, APPRO_STATUS.IN_PROGRESS] as string[]).includes(status) ||
      !!businessEmail
    );
  });

  protected readonly isEkycCompleted = computed(
    () => this.appData()?.applicationData.status === APPRO_STATUS.KFS_PENDING
  );

  // Desktop QR code URL — points to the mobile consent entry point
  protected readonly qrCodeUrl = computed(
    () => `${window.location.origin}/buyer/consent/${this.applicationId()}`
  );

  constructor() {
    // Amplitude: page view on load (both viewports)
    effect(() => {
      const appId = this.applicationId();

      if (appId) {
        this.amplitude.track(GET_STARTED_EVENTS.HOME_PAGE_VIEWED, { applicationId: appId });
      }
    });

    // Desktop: fire QR event + fetch names + poll every 15s for terminal status
    effect(() => {
      const appId = this.applicationId();

      if (!this.viewport.isDesktop() || !appId) {
        return;
      }

      this.amplitude.track(GET_STARTED_EVENTS.QR_CODE_DISPLAYED, { applicationId: appId });

      timer(0, POLL_INTERVAL_MS)
        .pipe(
          switchMap(() => this.service.pollApplication(appId)),
          // inclusive: process the terminal response, then complete
          takeWhile(
            res => !TERMINAL_STATUSES.includes(res.data?.applicationData.status ?? ''),
            true
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.appData.set(res.data);
              this.isLoading.set(false);

              if (TERMINAL_STATUSES.includes(res.data.applicationData.status)) {
                this.isVerificationDetected.set(true);
                this.amplitude.track(GET_STARTED_EVENTS.VERIFICATION_DETECTED, {
                  applicationId: appId,
                });
              }
            } else {
              this.router.navigate(['/not-found'], { replaceUrl: true });
            }
          },
          error: () => {
            this.router.navigate(['/not-found'], { replaceUrl: true });
          },
        });
    });

    // Mobile: one-shot fetch
    effect(() => {
      if (!this.viewport.isDesktop() && this.applicationId()) {
        this.fetchApplication(this.applicationId());
      }
    });

    // Mobile: auto-navigate when terminal status detected
    effect(() => {
      const data = this.appData();

      if (!data || this.viewport.isDesktop()) {
        return;
      }

      if (TERMINAL_STATUSES.includes(data.applicationData.status)) {
        this.router.navigate(['/buyer/verification-completed', this.applicationId()]);
      }
    });
  }

  private fetchApplication(applicationId: string): void {
    this.isLoading.set(true);

    this.service
      .getApplication(applicationId)
      .pipe(take(1))
      .subscribe({
        next: res => {
          if (res.success && res.data) {
            this.appData.set(res.data);
            this.isLoading.set(false);
          } else {
            this.router.navigate(['/not-found'], { replaceUrl: true });
          }
        },
        error: () => {
          this.router.navigate(['/not-found'], { replaceUrl: true });
        },
      });
  }

  // ── CTA navigation ─────────────────────────────────────────────────────────

  protected handleCtaClick(): void {
    const data = this.appData()?.applicationData;

    if (!data) {
      return;
    }

    const { status, links } = data;
    const businessEmail = data.applicants?.[0]?.businessEmail;
    const appId = this.applicationId();

    if (status === APPRO_STATUS.KFS_PENDING) {
      this.router.navigate(['/buyer/kfs', appId]);
      return;
    }

    if (status === APPRO_STATUS.PENDING && !businessEmail) {
      if (this.isConsentAccepted()) {
        this.consentState.approve(appId);
        this.router.navigate(['/buyer/buyer-details', appId]);
      } else {
        this.router.navigate(['/buyer/consent', appId]);
      }

      return;
    }

    if (status === APPRO_STATUS.LEAD || !!businessEmail) {
      window.location.href = links.eKyc.redirectUrl;
    }
  }
}
