import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent, DropdownComponent, InputComponent, TextComponent } from '@prypco/web-ui';
import type { DropdownItem } from '@prypco/web-ui';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, map, switchMap, take } from 'rxjs/operators';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { RumService } from '@core/rum';
import { PageLayoutComponent } from '@shared/ui/page-layout';
import { TopNavBuyerComponent } from '@shared/ui/top-nav-buyer';

import { BUYER_DETAILS_EVENTS, EMPTY_FORM, MONTHS } from '../buyer-details.constants';
import { buildYearOptions } from '../buyer-details.utils';
import type { BuyerApplicationData, BuyerDetailsFormFields } from '../buyer-details.model';
import { BuyerDetailsService } from '../buyer-details.service';

@Component({
  selector: 'app-buyer-details-page',
  imports: [
    PageLayoutComponent,
    TopNavBuyerComponent,
    TextComponent,
    InputComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './buyer-details-page.component.html',
  styleUrl: './buyer-details-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BuyerDetailsService);
  private readonly amplitude = inject(AMPLITUDE_SDK);
  private readonly rum = inject(RumService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  protected readonly applicationId = toSignal(
    this.route.paramMap.pipe(map(p => p.get('applicationId') ?? '')),
    { initialValue: '' }
  );

  // ── Remote data ────────────────────────────────────────────────────────────

  protected readonly isLoading = signal(true);
  protected readonly isSubmitting = signal(false);
  private readonly appData = signal<BuyerApplicationData | null>(null);
  private readonly appVersion = signal<number | null>(null);

  protected readonly brokerName = computed(() => this.appData()?.broker?.name ?? '');
  protected readonly brokerageName = computed(() => this.appData()?.brokerage?.name.trim() ?? '');
  protected readonly brokerageLogo = computed(() => this.appData()?.brokerage?.logo ?? '');
  protected readonly shortId = computed(() => this.appData()?.short_id ?? '');

  // ── Select options ─────────────────────────────────────────────────────────

  protected readonly emirateOptions = signal<readonly DropdownItem[]>([]);
  protected readonly industryOptions = signal<readonly DropdownItem[]>([]);
  protected readonly companyOptions = signal<readonly DropdownItem[]>([]);
  protected readonly monthOptions = MONTHS;
  protected readonly yearOptions = buildYearOptions();

  // ── Form state ─────────────────────────────────────────────────────────────

  protected readonly fields = signal<BuyerDetailsFormFields>(EMPTY_FORM);
  protected readonly hasAdditionalIncome = signal(false);
  protected readonly submitted = signal(false);

  // ── Validation ─────────────────────────────────────────────────────────────

  protected readonly canSubmit = computed(() => {
    const f = this.fields();

    return !!(
      f.email &&
      f.businessEmail &&
      f.salary &&
      f.companyName &&
      f.workingIndustry &&
      f.joiningMonth &&
      f.joiningYear &&
      f.homeAddress &&
      f.villaOrApartmentNumber &&
      f.buildingOrCommunity &&
      f.area &&
      f.emirate
    );
  });

  // ── Company autocomplete ───────────────────────────────────────────────────

  protected readonly isCompanySearching = signal(false);
  private readonly companyQuery$ = new Subject<string>();

  constructor() {
    this.companyQuery$
      .pipe(
        debounceTime(100),
        switchMap(q => this.service.searchCompanies(q)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          this.isCompanySearching.set(false);

          if (res.success) {
            this.companyOptions.set(res.data.companies.map(c => ({ value: c, label: c })));
          }
        },
        error: () => {
          this.isCompanySearching.set(false);
        },
      });

    // Load all data once applicationId is available
    const appId = this.applicationId();

    if (appId) {
      this.loadAll(appId);
    }
  }

  // ── Field updates ──────────────────────────────────────────────────────────

  protected patch(key: keyof BuyerDetailsFormFields, value: string): void {
    this.fields.update(f => ({ ...f, [key]: value }));
  }

  protected onNativeInput(key: keyof BuyerDetailsFormFields, event: Event): void {
    this.patch(key, (event.target as HTMLInputElement).value);
  }

  protected onCompanySearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();

    if (value.length >= 3) {
      this.isCompanySearching.set(true);
      this.companyQuery$.next(value);
    } else {
      this.isCompanySearching.set(false);
      this.companyOptions.set([]);
    }
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  protected goBack(): void {
    this.router.navigate(['/buyer/get-started', this.applicationId()]);
  }

  protected submit(): void {
    this.submitted.set(true);

    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }

    const data = this.appData();

    if (!data) {
      return;
    }

    this.isSubmitting.set(true);

    const f = this.fields();
    // Strip companyName before spreading — PUT schema rejects it; name lives in companyDetails.name.
    const applicantBase = { ...(data.applicants[0] ?? {}) } as Record<string, unknown>;
    delete applicantBase['companyName'];

    const updatedApplicant = {
      ...applicantBase,
      email: f.email,
      businessEmail: f.businessEmail,
      salary: this.parseNumber(f.salary),
      companyDetails: {
        name: f.companyName,
        joiningMonth: parseInt(f.joiningMonth, 10),
        joiningYear: parseInt(f.joiningYear, 10),
      },
      workingIndustry: f.workingIndustry,
      address: {
        homeAddress: f.homeAddress,
        villaOrApartmentNumber: f.villaOrApartmentNumber,
        buildingOrCommunity: f.buildingOrCommunity,
        area: f.area,
        emirate: f.emirate,
      },
    };

    const additionalFinancialData = this.hasAdditionalIncome()
      ? {
          annualRentalIncome: this.parseNumber(f.annualRentalIncome),
          annualBonus: this.parseNumber(f.annualBonus),
          annualComission: this.parseNumber(f.annualCommission),
          housingRentalAllowance: this.parseNumber(f.housingRentalAllowance),
          annualVariableAllowance: this.parseNumber(f.annualVariableAllowance),
          monthlyExpenses: {
            lifestyle: this.parseNumber(f.lifestyleExpenses),
            nonBankingBorrowing: this.parseNumber(f.nonBankingBorrowing),
          },
        }
      : data.additionalFinancialData;

    const version = this.appVersion();

    if (version === null) {
      return;
    }

    const payload = {
      applicationId: data.id,
      applicationData: {
        ...data,
        applicants: [updatedApplicant],
        additionalFinancialData,
      },
      version,
    };

    this.service
      .updateBuyerDetails(payload)
      .pipe(
        switchMap(() => this.service.validateApplication(data.id)),
        take(1)
      )
      .subscribe({
        next: () => {
          this.amplitude.track(BUYER_DETAILS_EVENTS.FORM_SUBMITTED, {
            applicationId: data.id,
          });

          const eKycUrl = this.appData()?.links.eKyc.redirectUrl;

          if (eKycUrl) {
            this.navigateExternal(eKycUrl);
          }
        },
        error: err => {
          this.rum.addError(err, {
            applicationId: data.id,
            context: 'buyer_details_submit_failed',
          });
          this.isSubmitting.set(false);
        },
      });
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private loadAll(applicationId: string): void {
    forkJoin({
      app: this.service.getApplication(applicationId),
      emirates: this.service.getEmirates(),
      industries: this.service.getWorkingIndustries(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ app, emirates, industries }) => {
          if (!app.success || !app.data) {
            this.router.navigate(['/not-found'], { replaceUrl: true });
            return;
          }

          this.appData.set(app.data.applicationData);
          this.appVersion.set(app.data.version);
          this.emirateOptions.set(emirates.data.emirates.map(e => ({ value: e, label: e })));
          this.industryOptions.set(
            industries.data.workingIndustries.map(i => ({ value: i.code, label: i.label }))
          );
          this.isLoading.set(false);
          this.prefill(app.data.applicationData);
        },
        error: () => {
          this.router.navigate(['/not-found'], { replaceUrl: true });
        },
      });
  }

  private prefill(data: BuyerApplicationData): void {
    const applicant = data.applicants[0];

    if (!applicant) {
      return;
    }

    this.fields.update(f => ({
      ...f,
      email: applicant.email ?? '',
      businessEmail: applicant.businessEmail ?? '',
      salary: applicant.salary ? String(applicant.salary) : '',
      companyName: applicant.companyDetails?.name ?? applicant.companyName ?? '',
      workingIndustry: applicant.workingIndustry ?? '',
      joiningMonth: applicant.companyDetails?.joiningMonth
        ? String(applicant.companyDetails.joiningMonth)
        : '',
      joiningYear: applicant.companyDetails?.joiningYear
        ? String(applicant.companyDetails.joiningYear)
        : '',
      homeAddress: applicant.address?.homeAddress ?? '',
      villaOrApartmentNumber: applicant.address?.villaOrApartmentNumber ?? '',
      buildingOrCommunity: applicant.address?.buildingOrCommunity ?? '',
      area: applicant.address?.area ?? '',
      emirate: applicant.address?.emirate ?? '',
    }));

    // Set native input DOM values so floating labels reflect pre-filled data
    afterNextRender(
      () => {
        this.setNativeInput('bd-email', applicant.email ?? '');
        this.setNativeInput('bd-business-email', applicant.businessEmail ?? '');
        this.setNativeInput('bd-salary', applicant.salary ? String(applicant.salary) : '');
        this.setNativeInput('bd-home-address', applicant.address?.homeAddress ?? '');
        this.setNativeInput('bd-villa', applicant.address?.villaOrApartmentNumber ?? '');
        this.setNativeInput('bd-building', applicant.address?.buildingOrCommunity ?? '');
        this.setNativeInput('bd-area', applicant.address?.area ?? '');
      },
      { injector: this.injector }
    );
  }

  private setNativeInput(id: string, value: string): void {
    if (!value) {
      return;
    }

    const el = document.getElementById(id) as HTMLInputElement | null;

    if (el) {
      el.value = value;
    }
  }

  protected navigateExternal(url: string): void {
    window.location.href = url;
  }

  private parseNumber(value: string): number {
    return parseFloat(value.replace(/,/g, '')) || 0;
  }
}
