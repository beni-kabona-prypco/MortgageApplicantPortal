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
import { ButtonComponent, CheckboxComponent, TextComponent } from '@prypco/web-ui';
import { map, switchMap, take } from 'rxjs/operators';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { BottomSheetComponent } from '@shared/ui/bottom-sheet';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import {
  BUREAU_CONSENT_INTRO,
  BUREAU_CONSENT_ITEMS,
  CONSENT_EVENTS,
  TNC_SECTIONS,
} from '../consent.constants';
import type { ConsentApplicationRecord } from '../consent.model';
import { ConsentService } from '../consent.service';

@Component({
  selector: 'app-consent-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    BottomSheetComponent,
    ButtonComponent,
    CheckboxComponent,
    TextComponent,
  ],
  templateUrl: './consent-page.component.html',
  styleUrl: './consent-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ConsentService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly amplitude = inject(AMPLITUDE_SDK);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── API state ──────────────────────────────────────────────────────────────

  protected readonly appData = signal<ConsentApplicationRecord | null>(null);

  // ── Derived nav data ───────────────────────────────────────────────────────

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

  // ── Consent checkboxes ─────────────────────────────────────────────────────

  protected readonly bureauConsent = signal(false);
  protected readonly tncConsent = signal(false);
  protected readonly dataAccuracyConsent = signal(false);

  protected readonly canAccept = computed(
    () => this.bureauConsent() && this.tncConsent() && this.dataAccuracyConsent()
  );

  // ── Bottom sheet state ─────────────────────────────────────────────────────

  protected readonly isBureauSheetOpen = signal(false);
  protected readonly isTncSheetOpen = signal(false);

  // ── Submit state ───────────────────────────────────────────────────────────

  protected readonly isSubmitting = signal(false);

  // ── Sheet content (exposed from constants for template use) ────────────────

  protected readonly bureauConsentIntro = BUREAU_CONSENT_INTRO;
  protected readonly bureauConsentItems = BUREAU_CONSENT_ITEMS;
  protected readonly tncSections = TNC_SECTIONS;

  constructor() {
    effect(() => {
      const appId = this.applicationId();

      if (!appId) {
        return;
      }

      this.service
        .getApplication(appId)
        .pipe(take(1), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            if (res.success && res.data) {
              this.appData.set(res.data);
            } else {
              this.router.navigate(['/not-found'], { replaceUrl: true });
            }
          },
          error: () => {
            this.router.navigate(['/not-found'], { replaceUrl: true });
          },
        });
    });
  }

  protected goBack(): void {
    this.router.navigate(['/buyer/get-started', this.applicationId()]);
  }

  protected acceptAndContinue(): void {
    if (!this.canAccept() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const appId = this.applicationId();

    this.service
      .submitConsent({ externalId: appId, bureau: true, tnc: true, dataAccuracy: true })
      .pipe(
        switchMap(() => this.service.getApplication(appId)),
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          this.amplitude.track(CONSENT_EVENTS.ACCEPTED, { applicationId: appId });

          const eKycUrl = res.data?.applicationData.links?.eKyc?.redirectUrl;

          if (eKycUrl) {
            this.navigateExternal(eKycUrl);
          } else {
            this.router.navigate(['/buyer/buyer-details', appId]);
          }
        },
        error: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  // Wrapped for testability
  protected navigateExternal(url: string): void {
    window.location.href = url;
  }
}
