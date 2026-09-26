import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';

import type { BuyerApplicationData, BuyerDetailsFormFields } from '../buyer-details.model';
import { BuyerDetailsService } from '../buyer-details.service';
import { BUYER_DETAILS_EVENTS } from '../buyer-details.constants';
import { BuyerDetailsPageComponent } from './buyer-details-page.component';

const APP_ID = 'test-app-id';
const EKYCURL = 'https://kyc.example.com/verify';

const makeAppData = (): BuyerApplicationData => ({
  id: APP_ID,
  short_id: 'IM-0001',
  status: 'Pending',
  version: 'v1',
  broker: { id: 'b1', name: 'Test Broker', logo: '' },
  brokerage: { id: 'br1', name: 'Test Brokerage', logo: '' },
  applicants: [
    {
      id: 'a1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@personal.com',
      businessEmail: 'john@work.com',
      salary: 25000,
      companyName: 'ACME Corp',
      workingIndustry: 'tech',
      companyDetails: { name: 'ACME Corp', joiningMonth: 3, joiningYear: 2020 },
      address: {
        homeAddress: '123 Main St',
        villaOrApartmentNumber: 'A1',
        buildingOrCommunity: 'Tech Tower',
        area: 'Downtown',
        emirate: 'Dubai',
      },
    },
  ],
  links: { eKyc: { redirectUrl: EKYCURL } },
});

const makeAppResponse = (data = makeAppData()) => ({
  success: true,
  data: { id: APP_ID, version: 1, applicationData: data },
  statusCode: 200,
  errorDetails: null,
});

const FILLED_FIELDS: BuyerDetailsFormFields = {
  email: 'john@personal.com',
  businessEmail: 'john@work.com',
  salary: '25000',
  companyName: 'ACME Corp',
  workingIndustry: 'tech',
  joiningMonth: '3',
  joiningYear: '2020',
  homeAddress: '123 Main St',
  villaOrApartmentNumber: 'A1',
  buildingOrCommunity: 'Tech Tower',
  area: 'Downtown',
  emirate: 'Dubai',
  annualRentalIncome: '',
  annualBonus: '',
  annualCommission: '',
  housingRentalAllowance: '',
  annualVariableAllowance: '',
  lifestyleExpenses: '',
  nonBankingBorrowing: '',
};

describe('BuyerDetailsPageComponent', () => {
  let component: BuyerDetailsPageComponent;
  let fixture: ComponentFixture<BuyerDetailsPageComponent>;
  let serviceSpy: jasmine.SpyObj<BuyerDetailsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: { track: jasmine.Spy };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<BuyerDetailsService>('BuyerDetailsService', [
      'getApplication',
      'getEmirates',
      'getWorkingIndustries',
      'searchCompanies',
      'updateBuyerDetails',
      'validateApplication',
    ]);
    serviceSpy.getApplication.and.returnValue(of(makeAppResponse()));
    serviceSpy.getEmirates.and.returnValue(
      of({ success: true, data: { emirates: ['Dubai', 'Abu Dhabi'] } })
    );
    serviceSpy.getWorkingIndustries.and.returnValue(
      of({
        success: true,
        data: { workingIndustries: [{ id: '1', code: 'tech', label: 'Technology' }] },
      })
    );
    serviceSpy.searchCompanies.and.returnValue(
      of({ success: true, data: { companies: ['ACME Corp'] } })
    );
    serviceSpy.updateBuyerDetails.and.returnValue(
      of({ success: true, data: { applicationId: APP_ID }, statusCode: 200, errorDetails: null })
    );
    serviceSpy.validateApplication.and.returnValue(
      of({ success: true, data: { isVerified: true }, statusCode: 200, errorDetails: null })
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = { track: jasmine.createSpy('track') };

    await TestBed.configureTestingModule({
      imports: [BuyerDetailsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
        { provide: Router, useValue: routerSpy },
        { provide: BuyerDetailsService, useValue: serviceSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
      ],
    })
      .overrideComponent(BuyerDetailsPageComponent, {
        // Empty template avoids read-only Element.prefix DOM error from [prefix]="'AED'" bindings
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA], template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(BuyerDetailsPageComponent);
    component = fixture.componentInstance;
    spyOn(component, 'navigateExternal' as never);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Initial load ───────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('calls getApplication, getEmirates, and getWorkingIndustries on init', () => {
      expect(serviceSpy.getApplication).toHaveBeenCalledWith(APP_ID);
      expect(serviceSpy.getEmirates).toHaveBeenCalled();
      expect(serviceSpy.getWorkingIndustries).toHaveBeenCalled();
    });

    it('populates emirateOptions from the API response', () => {
      expect(component['emirateOptions']()).toEqual([
        { value: 'Dubai', label: 'Dubai' },
        { value: 'Abu Dhabi', label: 'Abu Dhabi' },
      ]);
    });

    it('populates industryOptions with code as value and label as label', () => {
      expect(component['industryOptions']()).toEqual([{ value: 'tech', label: 'Technology' }]);
    });

    it('sets isLoading to false after data loads', () => {
      expect(component['isLoading']()).toBeFalse();
    });

    it('navigates to not-found when getApplication returns success: false', () => {
      serviceSpy.getApplication.and.returnValue(
        of({ success: false, data: null as never, statusCode: 404, errorDetails: null })
      );
      TestBed.createComponent(BuyerDetailsPageComponent).detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });

    it('navigates to not-found on load error', () => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      TestBed.createComponent(BuyerDetailsPageComponent).detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });
  });

  // ── Form prefill ───────────────────────────────────────────────────────────

  describe('form prefill', () => {
    it('populates email and businessEmail from applicant', () => {
      expect(component['fields']().email).toBe('john@personal.com');
      expect(component['fields']().businessEmail).toBe('john@work.com');
    });

    it('converts salary number to string', () => {
      expect(component['fields']().salary).toBe('25000');
    });

    it('reads companyName from companyDetails.name', () => {
      expect(component['fields']().companyName).toBe('ACME Corp');
    });

    it('reads workingIndustry from applicant', () => {
      expect(component['fields']().workingIndustry).toBe('tech');
    });

    it('converts joiningMonth and joiningYear to strings', () => {
      expect(component['fields']().joiningMonth).toBe('3');
      expect(component['fields']().joiningYear).toBe('2020');
    });

    it('populates all address fields', () => {
      const f = component['fields']();

      expect(f.homeAddress).toBe('123 Main St');
      expect(f.villaOrApartmentNumber).toBe('A1');
      expect(f.buildingOrCommunity).toBe('Tech Tower');
      expect(f.area).toBe('Downtown');
      expect(f.emirate).toBe('Dubai');
    });
  });

  // ── canSubmit ──────────────────────────────────────────────────────────────

  describe('canSubmit()', () => {
    it('is false when all fields are empty', () => {
      component['fields'].set({
        email: '',
        businessEmail: '',
        salary: '',
        companyName: '',
        workingIndustry: '',
        joiningMonth: '',
        joiningYear: '',
        homeAddress: '',
        villaOrApartmentNumber: '',
        buildingOrCommunity: '',
        area: '',
        emirate: '',
        annualRentalIncome: '',
        annualBonus: '',
        annualCommission: '',
        housingRentalAllowance: '',
        annualVariableAllowance: '',
        lifestyleExpenses: '',
        nonBankingBorrowing: '',
      });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is true when all required fields are filled', () => {
      component['fields'].set(FILLED_FIELDS);
      expect(component['canSubmit']()).toBeTrue();
    });

    it('is false when email is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, email: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when businessEmail is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, businessEmail: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when salary is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, salary: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when companyName is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, companyName: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when workingIndustry is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, workingIndustry: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when joiningMonth is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, joiningMonth: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when joiningYear is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, joiningYear: '' });
      expect(component['canSubmit']()).toBeFalse();
    });

    it('is false when emirate is missing', () => {
      component['fields'].set({ ...FILLED_FIELDS, emirate: '' });
      expect(component['canSubmit']()).toBeFalse();
    });
  });

  // ── Company autocomplete ───────────────────────────────────────────────────

  describe('company autocomplete', () => {
    it('calls searchCompanies after 100ms debounce when query is ≥3 chars', fakeAsync(() => {
      serviceSpy.searchCompanies.calls.reset();
      const event = { target: { value: 'ACM' } } as unknown as Event;

      component['onCompanySearch'](event);
      tick(100);

      expect(serviceSpy.searchCompanies).toHaveBeenCalledWith('ACM');
    }));

    it('does not call searchCompanies before debounce elapses', fakeAsync(() => {
      serviceSpy.searchCompanies.calls.reset();
      const event = { target: { value: 'ACM' } } as unknown as Event;

      component['onCompanySearch'](event);
      tick(99);

      expect(serviceSpy.searchCompanies).not.toHaveBeenCalled();
      tick(1);
    }));

    it('clears companyOptions when query is <3 chars', () => {
      component['companyOptions'].set([{ value: 'A', label: 'A Corp' }]);
      const event = { target: { value: 'AC' } } as unknown as Event;

      component['onCompanySearch'](event);

      expect(component['companyOptions']()).toEqual([]);
    });

    it('populates companyOptions from search response', fakeAsync(() => {
      serviceSpy.searchCompanies.and.returnValue(
        of({ success: true, data: { companies: ['ACME Corp', 'ACME Ltd'] } })
      );
      const event = { target: { value: 'ACME' } } as unknown as Event;

      component['onCompanySearch'](event);
      tick(100);

      expect(component['companyOptions']()).toEqual([
        { value: 'ACME Corp', label: 'ACME Corp' },
        { value: 'ACME Ltd', label: 'ACME Ltd' },
      ]);
    }));
  });

  // ── submit() ───────────────────────────────────────────────────────────────

  describe('submit()', () => {
    beforeEach(() => {
      component['fields'].set(FILLED_FIELDS);
    });

    it('sets submitted to true on call', () => {
      component['submit']();
      expect(component['submitted']()).toBeTrue();
    });

    it('does nothing when canSubmit is false', () => {
      component['fields'].set({ ...FILLED_FIELDS, email: '' });
      component['submit']();
      expect(serviceSpy.updateBuyerDetails).not.toHaveBeenCalled();
    });

    it('does nothing when already submitting', () => {
      component['isSubmitting'].set(true);
      component['submit']();
      expect(serviceSpy.updateBuyerDetails).not.toHaveBeenCalled();
    });

    it('does nothing when appData is null', () => {
      component['appData'].set(null);
      component['submit']();
      expect(serviceSpy.updateBuyerDetails).not.toHaveBeenCalled();
    });

    it('calls updateBuyerDetails with the application id', () => {
      component['submit']();
      expect(serviceSpy.updateBuyerDetails).toHaveBeenCalledOnceWith(
        jasmine.objectContaining({ applicationId: APP_ID })
      );
    });

    it('includes updated applicant email in the payload', () => {
      component['submit']();
      const payload = serviceSpy.updateBuyerDetails.calls.mostRecent().args[0];

      expect(payload.applicationData.applicants[0].email).toBe('john@personal.com');
      expect(payload.applicationData.applicants[0].businessEmail).toBe('john@work.com');
    });

    it('calls validateApplication after updateBuyerDetails succeeds', () => {
      component['submit']();
      expect(serviceSpy.validateApplication).toHaveBeenCalledWith(APP_ID);
    });

    it('fires Amplitude User_Submitted_details event on success', () => {
      component['submit']();
      expect(amplitudeSpy.track).toHaveBeenCalledWith(BUYER_DETAILS_EVENTS.FORM_SUBMITTED, {
        applicationId: APP_ID,
      });
    });

    it('navigates to eKYC URL on success', () => {
      component['submit']();
      expect(component['navigateExternal']).toHaveBeenCalledWith(EKYCURL);
    });

    it('resets isSubmitting on API error', () => {
      serviceSpy.updateBuyerDetails.and.returnValue(throwError(() => new Error('Network error')));
      component['submit']();
      expect(component['isSubmitting']()).toBeFalse();
    });

    it('does not navigate on API error', () => {
      serviceSpy.updateBuyerDetails.and.returnValue(throwError(() => new Error()));
      component['submit']();
      expect(component['navigateExternal']).not.toHaveBeenCalled();
    });
  });

  // ── goBack() ───────────────────────────────────────────────────────────────

  describe('goBack()', () => {
    it('navigates to /buyer/get-started with the applicationId', () => {
      component['goBack']();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/get-started', APP_ID]);
    });
  });

  // ── Additional income toggle ───────────────────────────────────────────────

  describe('additional income toggle', () => {
    it('starts as false', () => {
      expect(component['hasAdditionalIncome']()).toBeFalse();
    });

    it('can be toggled to true', () => {
      component['hasAdditionalIncome'].set(true);
      expect(component['hasAdditionalIncome']()).toBeTrue();
    });

    it('includes additional financial data in submit payload when toggled on', () => {
      component['hasAdditionalIncome'].set(true);
      component['fields'].set({
        ...FILLED_FIELDS,
        annualRentalIncome: '10000',
        annualBonus: '5000',
        lifestyleExpenses: '3000',
        nonBankingBorrowing: '1000',
      });
      component['submit']();

      const payload = serviceSpy.updateBuyerDetails.calls.mostRecent().args[0];

      expect(payload.applicationData.additionalFinancialData?.annualRentalIncome).toBe(10000);
      expect(payload.applicationData.additionalFinancialData?.annualBonus).toBe(5000);
      expect(payload.applicationData.additionalFinancialData?.monthlyExpenses?.lifestyle).toBe(
        3000
      );
    });
  });
});
