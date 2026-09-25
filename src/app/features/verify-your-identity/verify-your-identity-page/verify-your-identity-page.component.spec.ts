import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';

import { VERIFY_YOUR_IDENTITY_EVENTS } from '../verify-your-identity.constants';
import { VerifyYourIdentityService } from '../verify-your-identity.service';
import { VerifyYourIdentityPageComponent } from './verify-your-identity-page.component';

const APP_ID = 'test-app-id';
const EKYC_URL = 'https://ekyc.example.com/verify';

function makeResponse(eKycUrl = EKYC_URL) {
  return {
    success: true,
    statusCode: 200,
    errorDetails: null,
    data: {
      id: 'rec-1',
      applicationData: {
        id: APP_ID,
        short_id: 'IM-0001',
        broker: { id: 'b1', name: 'Broker A', logo: '' },
        brokerage: { id: 'bg1', name: '  Brokerage A  ', logo: 'https://logo.example.com' },
        links: { eKyc: { redirectUrl: eKycUrl } },
      },
    },
  };
}

describe('VerifyYourIdentityPageComponent', () => {
  let component: VerifyYourIdentityPageComponent;
  let fixture: ComponentFixture<VerifyYourIdentityPageComponent>;
  let serviceSpy: jasmine.SpyObj<VerifyYourIdentityService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: { track: jasmine.Spy };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<VerifyYourIdentityService>('VerifyYourIdentityService', [
      'getApplication',
    ]);
    serviceSpy.getApplication.and.returnValue(of(makeResponse()));
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = { track: jasmine.createSpy('track') };

    await TestBed.configureTestingModule({
      imports: [VerifyYourIdentityPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
        { provide: Router, useValue: routerSpy },
        { provide: VerifyYourIdentityService, useValue: serviceSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
      ],
    })
      .overrideComponent(VerifyYourIdentityPageComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VerifyYourIdentityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── initial data load ──────────────────────────────────────────────────────

  describe('initial load', () => {
    it('fetches application on init', () => {
      expect(serviceSpy.getApplication).toHaveBeenCalledWith(APP_ID);
    });

    it('sets isLoading to false after data loads', () => {
      expect(component['isLoading']()).toBeFalse();
    });

    it('trims brokerage name whitespace', () => {
      expect(component['brokerageName']()).toBe('Brokerage A');
    });

    it('navigates to not-found when getApplication returns success: false', () => {
      serviceSpy.getApplication.and.returnValue(
        of({ success: false, data: null as never, statusCode: 404, errorDetails: null })
      );
      const freshFixture = TestBed.createComponent(VerifyYourIdentityPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });

    it('navigates to not-found on getApplication error', () => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      const freshFixture = TestBed.createComponent(VerifyYourIdentityPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });

    it('sets hasError to true when eKYC URL is missing', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('')));
      const freshFixture = TestBed.createComponent(VerifyYourIdentityPageComponent);
      freshFixture.detectChanges();
      expect(freshFixture.componentInstance['hasError']()).toBeTrue();
    });

    it('sets hasError to false when eKYC URL is present', () => {
      expect(component['hasError']()).toBeFalse();
    });
  });

  // ── Amplitude ──────────────────────────────────────────────────────────────

  describe('Amplitude events', () => {
    it('fires PAGE_VIEWED on successful load with eKYC URL', () => {
      expect(amplitudeSpy.track).toHaveBeenCalledWith(VERIFY_YOUR_IDENTITY_EVENTS.PAGE_VIEWED, {
        applicationId: APP_ID,
      });
    });

    it('does not fire PAGE_VIEWED when eKYC URL is missing', () => {
      amplitudeSpy.track.calls.reset();
      serviceSpy.getApplication.and.returnValue(of(makeResponse('')));
      TestBed.createComponent(VerifyYourIdentityPageComponent).detectChanges();
      expect(amplitudeSpy.track).not.toHaveBeenCalledWith(
        VERIFY_YOUR_IDENTITY_EVENTS.PAGE_VIEWED,
        jasmine.anything()
      );
    });

    it('does not fire any event when getApplication fails', () => {
      amplitudeSpy.track.calls.reset();
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      TestBed.createComponent(VerifyYourIdentityPageComponent).detectChanges();
      expect(amplitudeSpy.track).not.toHaveBeenCalled();
    });
  });

  // ── startVerification ──────────────────────────────────────────────────────

  describe('startVerification()', () => {
    beforeEach(() => {
      spyOn(component, 'navigateExternal' as never);
    });

    it('fires EKYC_REDIRECT event and calls navigateExternal with the eKYC URL', () => {
      component['startVerification']();
      expect(amplitudeSpy.track).toHaveBeenCalledWith(VERIFY_YOUR_IDENTITY_EVENTS.EKYC_REDIRECT, {
        applicationId: APP_ID,
      });
      expect(component['navigateExternal']).toHaveBeenCalledWith(EKYC_URL);
    });

    it('sets isRedirecting to true after CTA click', () => {
      component['startVerification']();
      expect(component['isRedirecting']()).toBeTrue();
    });

    it('does nothing when hasError is true', () => {
      component['hasError'].set(true);
      component['eKycUrl'].set('');
      component['startVerification']();
      expect(component['navigateExternal']).not.toHaveBeenCalled();
    });

    it('does nothing when already redirecting', () => {
      component['isRedirecting'].set(true);
      component['startVerification']();
      expect(amplitudeSpy.track).not.toHaveBeenCalledWith(
        VERIFY_YOUR_IDENTITY_EVENTS.EKYC_REDIRECT,
        jasmine.anything()
      );
    });
  });
});
