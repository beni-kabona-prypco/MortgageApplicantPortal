import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';
import { ViewportService } from '@core/viewport';

import { VERIFICATION_COMPLETED_EVENTS } from '../verification-completed.constants';
import { VerificationCompletedService } from '../verification-completed.service';
import { VerificationCompletedPageComponent } from './verification-completed-page.component';

const APP_ID = 'test-app-id';

function makeResponse(status: string) {
  return {
    success: true,
    statusCode: 200,
    errorDetails: null,
    data: {
      id: 'rec-1',
      applicationData: {
        id: APP_ID,
        short_id: 'IM-0001',
        status,
        broker: { id: 'b1', name: 'Broker A', logo: '' },
        brokerage: { id: 'bg1', name: '  Brokerage A  ', logo: 'https://logo.example.com' },
      },
    },
  };
}

describe('VerificationCompletedPageComponent', () => {
  let component: VerificationCompletedPageComponent;
  let fixture: ComponentFixture<VerificationCompletedPageComponent>;
  let serviceSpy: jasmine.SpyObj<VerificationCompletedService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: { track: jasmine.Spy };
  let isDesktopSig: ReturnType<typeof signal<boolean>>;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<VerificationCompletedService>(
      'VerificationCompletedService',
      ['getApplication']
    );
    serviceSpy.getApplication.and.returnValue(of(makeResponse('In progress')));
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = { track: jasmine.createSpy('track') };
    isDesktopSig = signal(false);

    await TestBed.configureTestingModule({
      imports: [VerificationCompletedPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
        { provide: Router, useValue: routerSpy },
        { provide: VerificationCompletedService, useValue: serviceSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
        { provide: ViewportService, useValue: { isDesktop: isDesktopSig } },
      ],
    })
      .overrideComponent(VerificationCompletedPageComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(VerificationCompletedPageComponent);
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
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });

    it('navigates to not-found on getApplication error', () => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    });
  });

  // ── isEligible ─────────────────────────────────────────────────────────────

  describe('isEligible()', () => {
    it('is true for In progress status', () => {
      expect(component['isEligible']()).toBeTrue();
    });

    it('is true for Awaiting Bank Approval status', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('Awaiting Bank Approval')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent['isEligible']()).toBeTrue();
    });

    it('is false for Rejected status', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('Rejected')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent['isEligible']()).toBeFalse();
    });

    it('is false for No match status', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('No match')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent['isEligible']()).toBeFalse();
    });

    it('is false for No offers available status', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('No offers available')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent['isEligible']()).toBeFalse();
    });

    it('is false for Client not eligible status', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('Client not eligible')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      const freshComponent = freshFixture.componentInstance;
      expect(freshComponent['isEligible']()).toBeFalse();
    });
  });

  // ── headingText ────────────────────────────────────────────────────────────

  describe('headingText()', () => {
    it('shows success heading when eligible', () => {
      expect(component['headingText']()).toBe('Verification completed successfully!');
    });

    it('shows thank-you heading when ineligible', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('Rejected')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      expect(freshFixture.componentInstance['headingText']()).toBe('Thank you for applying!');
    });
  });

  // ── Amplitude ──────────────────────────────────────────────────────────────

  describe('Amplitude events', () => {
    it('fires User_Verificationcompleted on eligible status load', () => {
      expect(amplitudeSpy.track).toHaveBeenCalledWith(
        VERIFICATION_COMPLETED_EVENTS.VERIFICATION_COMPLETED,
        { applicationId: APP_ID }
      );
    });

    it('fires User_verificationFailed on ineligible status load', () => {
      serviceSpy.getApplication.and.returnValue(of(makeResponse('Rejected')));
      const freshFixture = TestBed.createComponent(VerificationCompletedPageComponent);
      freshFixture.detectChanges();
      expect(amplitudeSpy.track).toHaveBeenCalledWith(
        VERIFICATION_COMPLETED_EVENTS.VERIFICATION_FAILED,
        { applicationId: APP_ID }
      );
    });

    it('does not fire any event when getApplication fails', () => {
      amplitudeSpy.track.calls.reset();
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error()));
      TestBed.createComponent(VerificationCompletedPageComponent).detectChanges();
      expect(amplitudeSpy.track).not.toHaveBeenCalled();
    });
  });
});
