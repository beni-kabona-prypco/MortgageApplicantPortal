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
import { ButtonComponent, CheckboxComponent, TextComponent } from '@prypco/web-ui';
import { catchError, first, map, of, switchMap, take, timer } from 'rxjs';
import { PdfViewerModule } from 'ng2-pdf-viewer';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { RumService } from '@core/rum';
import { BottomSheetComponent } from '@shared/ui/bottom-sheet';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import { KFS_EVENTS, KFS_POLL_INTERVAL_MS, KFS_POLL_MAX_ATTEMPTS } from '../kfs.constants';
import type { KfsApplicationRecord, KfsDocument } from '../kfs.model';
import { KfsService } from '../kfs.service';

@Component({
  selector: 'app-kfs-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    TextComponent,
    ButtonComponent,
    CheckboxComponent,
    BottomSheetComponent,
    PdfViewerModule,
  ],
  templateUrl: './kfs-page.component.html',
  styleUrl: './kfs-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KfsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(KfsService);
  private readonly amplitude = inject(AMPLITUDE_SDK);
  private readonly rum = inject(RumService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── App data ──────────────────────────────────────────────────────────────

  protected readonly isLoading = signal(true);
  private readonly appData = signal<KfsApplicationRecord | null>(null);

  protected readonly shortId = computed(() => this.appData()?.applicationData.short_id ?? '');
  protected readonly brokerName = computed(() => this.appData()?.applicationData.broker.name ?? '');
  protected readonly brokerageName = computed(
    () => this.appData()?.applicationData.brokerage.name.trim() ?? ''
  );
  protected readonly brokerageLogo = computed(
    () => this.appData()?.applicationData.brokerage.logo ?? ''
  );

  // ── PDF polling ───────────────────────────────────────────────────────────

  protected readonly isPollingDoc = signal(true);
  protected readonly kfsDocument = signal<KfsDocument | null>(null);
  protected readonly pollTimedOut = signal(false);

  protected readonly pdfSrc = computed(() => this.kfsDocument()?.document ?? '');

  // ── Sheet state ───────────────────────────────────────────────────────────

  protected readonly isSheetOpen = signal(false);
  protected readonly hasAccepted = signal(false);
  protected readonly isPdfLoading = signal(true);

  // ── Submit ────────────────────────────────────────────────────────────────

  protected readonly isSubmitting = signal(false);

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)['pdfWorkerSrc'] = '/assets/pdf.worker.min.mjs';

    const appId = this.applicationId();

    if (!appId) {
      return;
    }

    this.service
      .getApplication(appId)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success || !res.data) {
            void this.router.navigate(['/not-found'], { replaceUrl: true });
            return;
          }

          this.appData.set(res.data);
          this.isLoading.set(false);
        },
        error: () => {
          void this.router.navigate(['/not-found'], { replaceUrl: true });
        },
      });

    this.startPollingDocument(appId);
  }

  private startPollingDocument(appId: string): void {
    timer(0, KFS_POLL_INTERVAL_MS)
      .pipe(
        take(KFS_POLL_MAX_ATTEMPTS),
        switchMap(() => this.service.pollApplication(appId).pipe(catchError(() => of(null)))),
        map(res => res?.data?.applicationData?.kfs),
        first(kfs => !!kfs?.document),
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(kfs => {
        if (kfs?.document) {
          this.kfsDocument.set(kfs);
        } else {
          this.rum.addError('kfs_poll_timeout', { applicationId: appId });
          this.pollTimedOut.set(true);
        }

        this.isPollingDoc.set(false);
      });
  }

  protected openKfs(): void {
    this.amplitude.track(KFS_EVENTS.KFS_OPENED, { applicationId: this.applicationId() });
    this.isPdfLoading.set(true);
    this.isSheetOpen.set(true);
  }

  protected closeSheet(): void {
    this.isSheetOpen.set(false);
    this.hasAccepted.set(false);
    this.isPdfLoading.set(true);
  }

  protected onPdfLoaded(): void {
    this.amplitude.track(KFS_EVENTS.VIEWED_DOCUMENT, { applicationId: this.applicationId() });
    this.isPdfLoading.set(false);
  }

  protected onPdfError(): void {
    this.rum.addError('kfs_pdf_load_failed', { applicationId: this.applicationId() });
    this.isPdfLoading.set(false);
  }

  protected confirm(): void {
    if (!this.hasAccepted() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const appId = this.applicationId();

    this.amplitude.track(KFS_EVENTS.CONFIRMED, { applicationId: appId });

    this.service
      .acceptKfs({ applicationID: appId })
      .pipe(
        catchError(err => {
          this.rum.addError(err, { applicationId: appId, context: 'kfs_accept_failed' });
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.proceed());
  }

  private proceed(): void {
    const appId = this.applicationId();

    this.amplitude.track(KFS_EVENTS.KFS_ACCEPTED, { applicationId: appId });
    this.amplitude.track(KFS_EVENTS.THANKYOU_PAGE, { applicationId: appId });
    void this.router.navigate(['/buyer/verification-completed', appId]);
  }

  protected downloadPdf(): void {
    const doc = this.kfsDocument();

    if (!doc?.document) {
      return;
    }

    const bankKey = doc.bankKey || 'KFS';
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    fetch(doc.document)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${bankKey}_KFS_${day}${month}${year}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
  }
}
