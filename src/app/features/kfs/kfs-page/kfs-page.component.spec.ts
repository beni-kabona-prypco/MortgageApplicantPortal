import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AMPLITUDE_SDK } from '@core/amplitude';

import { KFS_EVENTS, KFS_POLL_INTERVAL_MS, KFS_POLL_MAX_ATTEMPTS } from '../kfs.constants';
import { KfsService } from '../kfs.service';
import { KfsPageComponent } from './kfs-page.component';

const APP_ID = 'test-app-id';
const PDF_URL = 'https://example.com/kfs.pdf';

function makeAppResponse(hasDocument = false) {
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
        ...(hasDocument
          ? { kfs: { document: PDF_URL, bankKey: 'FIRST', offerId: 'offer-1' } }
          : {}),
      },
    },
  };
}

describe('KfsPageComponent', () => {
  let serviceSpy: jasmine.SpyObj<KfsService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let amplitudeSpy: { track: jasmine.Spy };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<KfsService>('KfsService', [
      'getApplication',
      'pollApplication',
      'acceptKfs',
    ]);
    serviceSpy.getApplication.and.returnValue(of(makeAppResponse()));
    serviceSpy.pollApplication.and.returnValue(of(makeAppResponse(true)));
    serviceSpy.acceptKfs.and.returnValue(
      of({
        success: true,
        statusCode: 200,
        errorDetails: null,
        data: { status: 'ok', message: '' },
      })
    );

    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    amplitudeSpy = { track: jasmine.createSpy('track') };

    await TestBed.configureTestingModule({
      imports: [KfsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ applicationId: APP_ID })) },
        },
        { provide: Router, useValue: routerSpy },
        { provide: KfsService, useValue: serviceSpy },
        { provide: AMPLITUDE_SDK, useValue: amplitudeSpy },
      ],
    })
      .overrideComponent(KfsPageComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
  });

  // Component creation happens inside fakeAsync so the polling timer is controlled.
  function create(): { fixture: ComponentFixture<KfsPageComponent>; component: KfsPageComponent } {
    const fixture = TestBed.createComponent(KfsPageComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  // ── initial load ────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('should create', fakeAsync(() => {
      const { component } = create();
      tick(0);
      expect(component).toBeTruthy();
    }));

    it('fetches application data on init', fakeAsync(() => {
      create();
      tick(0);
      expect(serviceSpy.getApplication).toHaveBeenCalledWith(APP_ID);
    }));

    it('sets isLoading to false after data loads', fakeAsync(() => {
      const { component } = create();
      tick(0);
      expect(component['isLoading']()).toBeFalse();
    }));

    it('trims brokerage name whitespace', fakeAsync(() => {
      const { component } = create();
      tick(0);
      expect(component['brokerageName']()).toBe('Brokerage A');
    }));

    it('navigates to not-found when getApplication returns success: false', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(
        of({ success: false, data: null as never, statusCode: 404, errorDetails: null })
      );
      create();
      tick(0);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    }));

    it('navigates to not-found on getApplication error', fakeAsync(() => {
      serviceSpy.getApplication.and.returnValue(throwError(() => new Error('network')));
      create();
      tick(0);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/not-found'], { replaceUrl: true });
    }));
  });

  // ── PDF polling ─────────────────────────────────────────────────────────────

  describe('PDF polling', () => {
    it('resolves pdfSrc on first poll when document is already present', fakeAsync(() => {
      const { component } = create();
      tick(0);
      expect(component['kfsDocument']()?.document).toBe(PDF_URL);
      expect(component['pdfSrc']()).toBe(PDF_URL);
      expect(component['isPollingDoc']()).toBeFalse();
    }));

    it('keeps polling until document arrives', fakeAsync(() => {
      let callCount = 0;
      serviceSpy.pollApplication.and.callFake(() => {
        callCount++;
        return of(makeAppResponse(callCount >= 3));
      });

      const { component } = create();
      tick(KFS_POLL_INTERVAL_MS * 3);

      expect(component['kfsDocument']()?.document).toBe(PDF_URL);
      expect(component['isPollingDoc']()).toBeFalse();
    }));

    it(`sets pollTimedOut after ${KFS_POLL_MAX_ATTEMPTS} failed attempts`, fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(of(makeAppResponse(false)));

      const { component } = create();
      tick(KFS_POLL_INTERVAL_MS * KFS_POLL_MAX_ATTEMPTS);

      expect(component['pollTimedOut']()).toBeTrue();
      expect(component['kfsDocument']()).toBeNull();
      expect(component['isPollingDoc']()).toBeFalse();
    }));

    it('handles poll HTTP errors gracefully and marks timed out', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(throwError(() => new Error('timeout')));

      const { component } = create();
      tick(KFS_POLL_INTERVAL_MS * KFS_POLL_MAX_ATTEMPTS);

      expect(component['pollTimedOut']()).toBeTrue();
      expect(component['isPollingDoc']()).toBeFalse();
    }));
  });

  // ── openKfs ─────────────────────────────────────────────────────────────────

  describe('openKfs()', () => {
    it('opens the bottom sheet', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['openKfs']();
      expect(component['isSheetOpen']()).toBeTrue();
    }));

    it('fires User_KFS_Opened amplitude event', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['openKfs']();
      expect(amplitudeSpy.track).toHaveBeenCalledWith(KFS_EVENTS.KFS_OPENED, {
        applicationId: APP_ID,
      });
    }));

    it('resets isPdfLoading when opening', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['isPdfLoading'].set(false);
      component['openKfs']();
      expect(component['isPdfLoading']()).toBeTrue();
    }));
  });

  // ── closeSheet ───────────────────────────────────────────────────────────────

  describe('closeSheet()', () => {
    it('closes the sheet and resets hasAccepted', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['isSheetOpen'].set(true);
      component['hasAccepted'].set(true);

      component['closeSheet']();

      expect(component['isSheetOpen']()).toBeFalse();
      expect(component['hasAccepted']()).toBeFalse();
    }));
  });

  // ── onPdfLoaded ──────────────────────────────────────────────────────────────

  describe('onPdfLoaded()', () => {
    it('sets isPdfLoading to false and fires User_Viewed_KFS_Document', fakeAsync(() => {
      const { component } = create();
      tick(0);
      amplitudeSpy.track.calls.reset();

      component['onPdfLoaded']();

      expect(component['isPdfLoading']()).toBeFalse();
      expect(amplitudeSpy.track).toHaveBeenCalledWith(KFS_EVENTS.VIEWED_DOCUMENT, {
        applicationId: APP_ID,
      });
    }));
  });

  // ── confirm ──────────────────────────────────────────────────────────────────

  describe('confirm()', () => {
    it('does nothing when hasAccepted is false', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['hasAccepted'].set(false);
      component['confirm']();
      expect(serviceSpy.acceptKfs).not.toHaveBeenCalled();
    }));

    it('does nothing when already submitting', fakeAsync(() => {
      const { component } = create();
      tick(0);
      component['hasAccepted'].set(true);
      component['isSubmitting'].set(true);
      component['confirm']();
      expect(serviceSpy.acceptKfs).not.toHaveBeenCalled();
    }));

    it('fires User_KFS_Confirmed and calls acceptKfs with correct applicationID', fakeAsync(() => {
      const { component } = create();
      tick(0);
      amplitudeSpy.track.calls.reset();

      component['hasAccepted'].set(true);
      component['confirm']();

      expect(amplitudeSpy.track).toHaveBeenCalledWith(KFS_EVENTS.CONFIRMED, {
        applicationId: APP_ID,
      });
      expect(serviceSpy.acceptKfs).toHaveBeenCalledWith({ applicationID: APP_ID });
    }));

    it('fires mo_KFS_accepted + Thankyou_Page and navigates to verification-completed', fakeAsync(() => {
      const { component } = create();
      tick(0);
      amplitudeSpy.track.calls.reset();

      component['hasAccepted'].set(true);
      component['confirm']();

      expect(amplitudeSpy.track).toHaveBeenCalledWith(KFS_EVENTS.KFS_ACCEPTED, {
        applicationId: APP_ID,
      });
      expect(amplitudeSpy.track).toHaveBeenCalledWith(KFS_EVENTS.THANKYOU_PAGE, {
        applicationId: APP_ID,
      });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/verification-completed', APP_ID]);
    }));

    it('still navigates on acceptKfs error (best-effort)', fakeAsync(() => {
      serviceSpy.acceptKfs.and.returnValue(throwError(() => new Error('BE error')));
      const { component } = create();
      tick(0);

      component['hasAccepted'].set(true);
      component['confirm']();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/buyer/verification-completed', APP_ID]);
    }));
  });

  // ── downloadPdf ──────────────────────────────────────────────────────────────

  describe('downloadPdf()', () => {
    it('does nothing when kfsDocument is null', fakeAsync(() => {
      serviceSpy.pollApplication.and.returnValue(of(makeAppResponse(false)));
      const { component } = create();
      tick(KFS_POLL_INTERVAL_MS * KFS_POLL_MAX_ATTEMPTS);

      spyOn(window, 'fetch');
      component['downloadPdf']();
      expect(window.fetch).not.toHaveBeenCalled();
    }));

    it('fetches the document URL as a blob', fakeAsync(() => {
      const { component } = create();
      tick(0);

      const blob = new Blob(['pdf'], { type: 'application/pdf' });
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({ blob: () => Promise.resolve(blob) } as Response)
      );
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
      spyOn(window.URL, 'revokeObjectURL');

      component['downloadPdf']();
      tick();

      expect(window.fetch).toHaveBeenCalledWith(PDF_URL);
    }));

    it('triggers a download link with the bankKey filename', fakeAsync(() => {
      const { component } = create();
      tick(0);

      const blob = new Blob(['pdf'], { type: 'application/pdf' });
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({ blob: () => Promise.resolve(blob) } as Response)
      );
      spyOn(window.URL, 'createObjectURL').and.returnValue('blob:fake');
      spyOn(window.URL, 'revokeObjectURL');
      const appendSpy = spyOn(document.body, 'appendChild').and.callThrough();

      component['downloadPdf']();
      tick();

      const link = appendSpy.calls.mostRecent().args[0] as HTMLAnchorElement;
      expect(link.download).toBe('FIRST_KFS.pdf');
    }));
  });
});
