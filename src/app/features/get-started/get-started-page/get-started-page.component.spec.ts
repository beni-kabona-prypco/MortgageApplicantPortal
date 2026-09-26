import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flushMicrotasks,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';
import type { AmplitudeSdk } from '@core/amplitude';
import { ViewportService } from '@core/viewport';

import { APPRO_STATUS } from '@core/application';
import { GET_STARTED_EVENTS, POLL_INTERVAL_MS } from '../get-started.constants';
import type { GetApplicationResponse } from '../get-started.model';
import { GetStartedService } from '../get-started.service';

import { GetStartedPageComponent } from './get-started-page.component';

const APP_ID = 'test-app-id';

function makeResponse(status: string, shortId = 'SHORT1'): GetApplicationResponse {
  return {
    success: true,
    data: {
      id: APP_ID,
      applicationData: {
        id: APP_ID,
        short_id: shortId,
        status,
        broker: { id: 'b1', name: 'Broker Name', logo: '' },
        brokerage: {
          id: 'br1',
          name: '  Brokerage Name  ',
          logo: 'https://logo.example.com/logo.png',
        },
        applicants: [{ id: 'a1', firstName: 'John', lastName: 'Doe' }],
        consents: null,
        links: { eKyc: { redirectUrl: 'https://kyc.example.com' } },
      },
    },
    statusCode: 200,
    timestamp: '',
    errorDetails: null,
  };
}

describe('GetStartedPageComponent', () => {
  let fixture: ComponentFixture<GetStartedPageComponent>;
  let component: GetStartedPageComponent;
  let serviceSpy: jasmine.SpyObj<GetStartedService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: jasmine.SpyObj<AmplitudeSdk>;
  let isDesktopSig: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<GetStartedService>('GetStartedService', [
      'getApplication',
      'pollApplication',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = jasmine.createSpyObj<AmplitudeSdk>('AmplitudeSdk', ['init', 'track', 'reset']);
    isDesktopSig = signal(false);

    routerSpy.navigate.and.returnValue(Promise.resolve(true));
    serviceSpy.getApplication.and.returnValue(of(makeResponse(APPRO_STATUS.PENDING)));
    serviceSpy.pollApplication.and.returnValue(of(makeResponse(APPRO_STATUS.PENDING)));

    await TestBed.configureTestingModule({
      imports: [GetStartedPageComponent],
      providers: [
        { provide: GetStartedService, useValue: serviceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
        { provide: ViewportService, useValue: { isDesktop: isDesktopSig } },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
      ],
    })
      .overrideComponent(GetStartedPageComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(GetStartedPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // ── QR URL ──────────────────────────────────────────────────────────────────

  describe('qrCodeUrl', () => {
    it('is built from window.location.origin + /buyer/consent/ + applicationId', () => {
      fixture.detectChanges();
      expect(component['qrCodeUrl']()).toBe(`${window.location.origin}/buyer/consent/${APP_ID}`);
    });
  });

  // ── Amplitude: page view ────────────────────────────────────────────────────

  describe('Amplitude HOME_PAGE_VIEWED', () => {
    it('fires buyer_home_page_viewed on load', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(amplitudeSpy.track).toHaveBeenCalledWith(GET_STARTED_EVENTS.HOME_PAGE_VIEWED, {
        applicationId: APP_ID,
      });
    }));
  });

  // ── Mobile ──────────────────────────────────────────────────────────────────

  describe('mobile', () => {
    beforeEach(() => {
      isDesktopSig.set(false);
    });

    it('fetches application on init', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(serviceSpy.getApplication).toHaveBeenCalledOnceWith(APP_ID);
    }));

    it('binds buyer first name from API response', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(component['buyerFirstName']()).toBe('John');
    }));

    it('binds broker name from API response', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(component['brokerName']()).toBe('Broker Name');
    }));

    it('trims whitespace from brokerage name', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(component['brokerageName']()).toBe('Brokerage Name');
    }));

    it('binds shortId from API response', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(component['shortId']()).toBe('SHORT1');
    }));

    it('navigates to /not-found when API returns success:false', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(
        of({
          success: false,
          data: null as never,
          statusCode: 404,
          timestamp: '',
          errorDetails: null,
        })
      );

      fixture.detectChanges();
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    }));

    it('navigates to /not-found on API error', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    }));

    it('navigates to /buyer/verification-completed on terminal status', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(
        of(makeResponse(APPRO_STATUS.AWAITING_BANK_APPROVAL))
      );

      fixture.detectChanges();
      flushMicrotasks();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/verification-completed', APP_ID]);
    }));

    it('does not set isVerificationDetected on terminal status (desktop-only concept)', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(
        of(makeResponse(APPRO_STATUS.AWAITING_BANK_APPROVAL))
      );

      fixture.detectChanges();
      flushMicrotasks();

      expect(component['isVerificationDetected']()).toBeFalse();
    }));
  });

  // ── Desktop ─────────────────────────────────────────────────────────────────

  describe('desktop', () => {
    beforeEach(() => {
      isDesktopSig.set(true);
    });

    it('polls immediately on init via pollApplication', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(serviceSpy.pollApplication).toHaveBeenCalledWith(APP_ID);

      discardPeriodicTasks();
    }));

    it('polls every POLL_INTERVAL_MS', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(serviceSpy.pollApplication).toHaveBeenCalledTimes(1);

      tick(POLL_INTERVAL_MS);
      expect(serviceSpy.pollApplication).toHaveBeenCalledTimes(2);

      tick(POLL_INTERVAL_MS);
      expect(serviceSpy.pollApplication).toHaveBeenCalledTimes(3);

      discardPeriodicTasks();
    }));

    it('stops polling when a terminal status is returned', fakeAsync(() => {
      let callCount = 0;

      serviceSpy.pollApplication.and.callFake(() => {
        callCount++;
        const status = callCount === 2 ? APPRO_STATUS.AWAITING_BANK_APPROVAL : APPRO_STATUS.PENDING;

        return of(makeResponse(status));
      });

      fixture.detectChanges();
      flushMicrotasks();
      tick(0); // 1st call → Pending
      tick(POLL_INTERVAL_MS); // 2nd call → terminal

      const totalAfterTerminal = serviceSpy.getApplication.calls.count();

      tick(POLL_INTERVAL_MS); // should NOT trigger another call
      expect(serviceSpy.getApplication.calls.count()).toBe(totalAfterTerminal);
    }));

    it('sets isVerificationDetected when terminal status is received', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(
        of(makeResponse(APPRO_STATUS.AWAITING_BANK_APPROVAL))
      );

      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(component['isVerificationDetected']()).toBeTrue();
    }));

    it('sets isLoading to false after first poll response', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(component['isLoading']()).toBeFalse();

      discardPeriodicTasks();
    }));

    it('fires buyer_qr_code_displayed on desktop init', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();

      expect(amplitudeSpy.track).toHaveBeenCalledWith(GET_STARTED_EVENTS.QR_CODE_DISPLAYED, {
        applicationId: APP_ID,
      });

      discardPeriodicTasks();
    }));

    it('fires buyer_verification_detected when terminal status is received', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(
        of(makeResponse(APPRO_STATUS.AWAITING_BANK_APPROVAL))
      );

      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(amplitudeSpy.track).toHaveBeenCalledWith(GET_STARTED_EVENTS.VERIFICATION_DETECTED, {
        applicationId: APP_ID,
      });
    }));

    it('stops polling on component destroy', fakeAsync(() => {
      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      const callsAfterInit = serviceSpy.getApplication.calls.count();

      fixture.destroy();

      tick(POLL_INTERVAL_MS * 5);

      expect(serviceSpy.getApplication.calls.count()).toBe(callsAfterInit);
    }));

    it('navigates to /not-found on API error during polling', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    }));

    it('does not navigate to verification-completed on terminal status (desktop shows success in place)', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(
        of(makeResponse(APPRO_STATUS.AWAITING_BANK_APPROVAL))
      );

      fixture.detectChanges();
      flushMicrotasks();
      tick(0);

      expect(routerSpy.navigate).not.toHaveBeenCalledWith([
        '/buyer/verification-completed',
        APP_ID,
      ]);
    }));
  });
});
