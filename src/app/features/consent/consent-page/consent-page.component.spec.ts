import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { convertToParamMap } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';

import { ConsentService } from '../consent.service';
import { ConsentPageComponent } from './consent-page.component';

const APP_ID = 'test-app-id';

const makeAppResponse = (eKycUrl = 'https://ekycprovider.com/verify') => ({
  success: true,
  data: {
    id: 'record-1',
    applicationData: {
      id: APP_ID,
      short_id: 'IM-0001',
      broker: { id: 'b1', name: 'Broker A', logo: '' },
      brokerage: { id: 'bg1', name: 'Brokerage A', logo: '' },
      links: { eKyc: { redirectUrl: eKycUrl } },
    },
  },
  statusCode: 200,
  errorDetails: null,
});

describe('ConsentPageComponent', () => {
  let component: ConsentPageComponent;
  let fixture: ComponentFixture<ConsentPageComponent>;
  let serviceSpy: jasmine.SpyObj<ConsentService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: { track: jasmine.Spy };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<ConsentService>('ConsentService', [
      'getApplication',
      'submitConsent',
    ]);
    serviceSpy.getApplication.and.returnValue(of(makeAppResponse()));
    serviceSpy.submitConsent.and.returnValue(
      of({ success: true, statusCode: 200, errorDetails: null })
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = { track: jasmine.createSpy('track') };

    await TestBed.configureTestingModule({
      imports: [ConsentPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
        { provide: Router, useValue: routerSpy },
        { provide: ConsentService, useValue: serviceSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
      ],
    })
      .overrideComponent(ConsentPageComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ConsentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── canAccept ──────────────────────────────────────────────────────────────

  describe('canAccept()', () => {
    it('is false when no checkboxes are checked', () => {
      expect(component['canAccept']()).toBeFalse();
    });

    it('is false when only bureau is checked', () => {
      component['bureauConsent'].set(true);
      expect(component['canAccept']()).toBeFalse();
    });

    it('is false when only bureau and T&C are checked', () => {
      component['bureauConsent'].set(true);
      component['tncConsent'].set(true);
      expect(component['canAccept']()).toBeFalse();
    });

    it('is true when all 3 checkboxes are checked', () => {
      component['bureauConsent'].set(true);
      component['tncConsent'].set(true);
      component['dataAccuracyConsent'].set(true);
      expect(component['canAccept']()).toBeTrue();
    });
  });

  // ── Bottom sheets ──────────────────────────────────────────────────────────

  describe('bureau bottom sheet', () => {
    it('starts closed', () => {
      expect(component['isBureauSheetOpen']()).toBeFalse();
    });

    it('opens when isBureauSheetOpen is set to true', () => {
      component['isBureauSheetOpen'].set(true);
      expect(component['isBureauSheetOpen']()).toBeTrue();
    });

    it('closes when isBureauSheetOpen is set to false', () => {
      component['isBureauSheetOpen'].set(true);
      component['isBureauSheetOpen'].set(false);
      expect(component['isBureauSheetOpen']()).toBeFalse();
    });
  });

  describe('T&C bottom sheet', () => {
    it('starts closed', () => {
      expect(component['isTncSheetOpen']()).toBeFalse();
    });

    it('opens when isTncSheetOpen is set to true', () => {
      component['isTncSheetOpen'].set(true);
      expect(component['isTncSheetOpen']()).toBeTrue();
    });

    it('closes when isTncSheetOpen is set to false', () => {
      component['isTncSheetOpen'].set(true);
      component['isTncSheetOpen'].set(false);
      expect(component['isTncSheetOpen']()).toBeFalse();
    });
  });

  // ── acceptAndContinue ──────────────────────────────────────────────────────

  describe('acceptAndContinue()', () => {
    beforeEach(() => {
      component['bureauConsent'].set(true);
      component['tncConsent'].set(true);
      component['dataAccuracyConsent'].set(true);
      spyOn(component, 'navigateExternal' as never);
    });

    it('does nothing when canAccept is false', () => {
      component['bureauConsent'].set(false);
      component['acceptAndContinue']();
      expect(serviceSpy.submitConsent).not.toHaveBeenCalled();
    });

    it('does nothing when already submitting', () => {
      component['isSubmitting'].set(true);
      component['acceptAndContinue']();
      expect(serviceSpy.submitConsent).not.toHaveBeenCalled();
    });

    it('calls submitConsent with externalId and all consents true', () => {
      component['acceptAndContinue']();
      expect(serviceSpy.submitConsent).toHaveBeenCalledOnceWith({
        externalId: APP_ID,
        bureau: true,
        tnc: true,
        dataAccuracy: true,
      });
    });

    it('fetches application after submit to resolve eKYC URL', () => {
      serviceSpy.getApplication.calls.reset();
      component['acceptAndContinue']();
      expect(serviceSpy.getApplication).toHaveBeenCalledWith(APP_ID);
    });

    it('fires Amplitude User_accepted_AECB event on success', () => {
      component['acceptAndContinue']();
      expect(amplitudeSpy.track).toHaveBeenCalledWith('User_accepted_AECB', {
        applicationId: APP_ID,
      });
    });

    it('redirects to eKYC URL when available', () => {
      component['acceptAndContinue']();
      expect(component['navigateExternal']).toHaveBeenCalledWith('https://ekycprovider.com/verify');
    });

    it('navigates to buyer-details when eKYC URL is empty (best-effort fallback)', () => {
      serviceSpy.getApplication.and.returnValue(of(makeAppResponse('')));
      component['acceptAndContinue']();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/buyer-details', APP_ID]);
    });

    it('navigates to buyer-details when eKYC URL is missing from response', () => {
      const responseWithoutUrl = {
        ...makeAppResponse(),
        data: {
          ...makeAppResponse().data,
          applicationData: {
            ...makeAppResponse().data.applicationData,
            links: { eKyc: { redirectUrl: '' } },
          },
        },
      };
      serviceSpy.getApplication.and.returnValue(of(responseWithoutUrl));
      component['acceptAndContinue']();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/buyer-details', APP_ID]);
    });

    it('resets isSubmitting on API error', () => {
      serviceSpy.submitConsent.and.returnValue(throwError(() => new Error('Network error')));
      component['acceptAndContinue']();
      expect(component['isSubmitting']()).toBeFalse();
    });

    it('does not redirect on API error', () => {
      serviceSpy.submitConsent.and.returnValue(throwError(() => new Error('Network error')));
      component['acceptAndContinue']();
      expect(component['navigateExternal']).not.toHaveBeenCalled();
      expect(routerSpy.navigate).not.toHaveBeenCalledWith(
        jasmine.arrayContaining(['/buyer/buyer-details'])
      );
    });
  });

  // ── goBack ─────────────────────────────────────────────────────────────────

  describe('goBack()', () => {
    it('navigates to get-started with the applicationId', () => {
      component['goBack']();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/get-started', APP_ID]);
    });
  });

  // ── initial data load ──────────────────────────────────────────────────────

  describe('initial load', () => {
    it('fetches application on init', () => {
      expect(serviceSpy.getApplication).toHaveBeenCalledWith(APP_ID);
    });

    it('populates appData on success', () => {
      expect(component['appData']()).toEqual(makeAppResponse().data as never);
    });

    it('navigates to not-found when getApplication returns success: false', async () => {
      serviceSpy.getApplication.and.returnValue(
        of({ success: false, data: null as never, statusCode: 404, errorDetails: null })
      );
      const freshFixture = TestBed.createComponent(ConsentPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });

    it('navigates to not-found on getApplication error', () => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      const freshFixture = TestBed.createComponent(ConsentPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });
  });
});
