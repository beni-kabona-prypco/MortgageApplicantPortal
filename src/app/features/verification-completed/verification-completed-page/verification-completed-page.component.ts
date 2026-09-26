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
import { TextComponent } from '@prypco/web-ui';
import { map, take } from 'rxjs/operators';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { ViewportService } from '@core/viewport';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import { APPRO_STATUS } from '@core/application';
import {
  INELIGIBLE_STATUSES,
  KFS_POST_STATUSES,
  VERIFICATION_COMPLETED_EVENTS,
} from '../verification-completed.constants';
import type { VerificationCompletedApplicationRecord } from '../verification-completed.model';
import { VerificationCompletedService } from '../verification-completed.service';

@Component({
  selector: 'app-verification-completed-page',
  imports: [PageLayoutComponent, TopNavBuyerComponent, TextComponent],
  templateUrl: './verification-completed-page.component.html',
  styleUrl: './verification-completed-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerificationCompletedPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(VerificationCompletedService);
  private readonly amplitude = inject(AMPLITUDE_SDK);
  private readonly destroyRef = inject(DestroyRef);
  private readonly viewport = inject(ViewportService);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── Remote data ────────────────────────────────────────────────────────────

  protected readonly isLoading = signal(true);
  private readonly appData = signal<VerificationCompletedApplicationRecord | null>(null);

  // ── Derived nav data ───────────────────────────────────────────────────────

  protected readonly brokerName = computed(() => this.appData()?.applicationData.broker.name ?? '');
  protected readonly brokerageName = computed(
    () => this.appData()?.applicationData.brokerage.name.trim() ?? ''
  );
  protected readonly brokerageLogo = computed(
    () => this.appData()?.applicationData.brokerage.logo ?? ''
  );
  protected readonly shortId = computed(() => this.appData()?.applicationData.short_id ?? '');

  // ── Page state ─────────────────────────────────────────────────────────────

  protected readonly isEligible = computed(() => {
    const status = this.appData()?.applicationData.status ?? '';

    return !INELIGIBLE_STATUSES.has(status);
  });

  protected readonly headingText = computed(() =>
    this.isEligible() ? 'Verification completed successfully!' : 'Thank you for applying!'
  );

  protected readonly isDesktop = this.viewport.isDesktop;

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

            const status = res.data.applicationData.status;

            if (status === APPRO_STATUS.IN_PROGRESS) {
              this.amplitude.track(VERIFICATION_COMPLETED_EVENTS.VERIFICATION_COMPLETED, {
                applicationId: res.data.applicationData.id,
              });
            } else if (KFS_POST_STATUSES.has(status)) {
              this.amplitude.track(VERIFICATION_COMPLETED_EVENTS.THANKYOU_PAGE, {
                applicationId: res.data.applicationData.id,
              });
            } else if (INELIGIBLE_STATUSES.has(status)) {
              this.amplitude.track(VERIFICATION_COMPLETED_EVENTS.VERIFICATION_FAILED, {
                applicationId: res.data.applicationData.id,
              });
            }
          },
          error: () => {
            this.router.navigate(['/not-found'], { replaceUrl: true });
          },
        });
    }
  }
}
