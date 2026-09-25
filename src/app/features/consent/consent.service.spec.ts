import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import type {
  GetConsentApplicationResponse,
  SubmitConsentRequest,
  SubmitConsentResponse,
} from './consent.model';
import { ConsentService } from './consent.service';

describe('ConsentService', () => {
  let service: ConsentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConsentService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ConsentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getApplication ─────────────────────────────────────────────────────────

  describe('getApplication()', () => {
    const APP_ID = 'app-123';

    it('GETs /Buyer/Application/:id', () => {
      service.getApplication(APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('returns the response body', () => {
      const mockResponse: GetConsentApplicationResponse = {
        success: true,
        statusCode: 200,
        errorDetails: null,
        data: {
          id: 'rec-1',
          applicationData: {
            id: APP_ID,
            short_id: 'IM-0001',
            broker: { id: 'b1', name: 'Broker A', logo: '' },
            brokerage: { id: 'bg1', name: 'Brokerage A', logo: '' },
            links: { eKyc: { redirectUrl: 'https://ekycprovider.com/verify' } },
          },
        },
      };

      let result: GetConsentApplicationResponse | undefined;
      service.getApplication(APP_ID).subscribe(r => (result = r));

      httpMock.expectOne(`/Buyer/Application/${APP_ID}`).flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });

  // ── getApplicationFresh ────────────────────────────────────────────────────

  describe('getApplicationFresh()', () => {
    const FRESH_APP_ID = 'app-fresh-456';

    const freshResponse: GetConsentApplicationResponse = {
      success: true,
      statusCode: 200,
      errorDetails: null,
      data: {
        id: FRESH_APP_ID,
        applicationData: {
          id: FRESH_APP_ID,
          short_id: 'IM-0002',
          broker: { id: 'b2', name: 'Fresh Broker', logo: '' },
          brokerage: { id: 'bg2', name: 'Fresh Brokerage', logo: '' },
          links: { eKyc: { redirectUrl: 'https://kyc.example.com/fresh' } },
        },
      },
    };

    it('GETs /Buyer/Application/:id', () => {
      service.getApplicationFresh(FRESH_APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${FRESH_APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('re-fetches even when application is already cached', () => {
      service.getApplication(FRESH_APP_ID).subscribe();
      httpMock.expectOne(`/Buyer/Application/${FRESH_APP_ID}`).flush(freshResponse);

      service.getApplicationFresh(FRESH_APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${FRESH_APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush(freshResponse);
    });

    it('returns the response body', () => {
      let result: GetConsentApplicationResponse | undefined;

      service.getApplicationFresh(FRESH_APP_ID).subscribe(r => (result = r));
      httpMock.expectOne(`/Buyer/Application/${FRESH_APP_ID}`).flush(freshResponse);

      expect(result).toEqual(freshResponse);
    });
  });

  // ── submitConsent ──────────────────────────────────────────────────────────

  describe('submitConsent()', () => {
    const consent = { accepted: true, timestamp: 1234567890 };
    const request: SubmitConsentRequest = {
      externalId: 'app-123',
      bureau: consent,
      tnc: consent,
      dataAccuracy: consent,
      request: consent,
    };

    it('PUTs /CustomerPortal/application/consents', () => {
      service.submitConsent(request).subscribe();
      const req = httpMock.expectOne('/CustomerPortal/application/consents');
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    it('sends the full request body', () => {
      service.submitConsent(request).subscribe();
      const req = httpMock.expectOne('/CustomerPortal/application/consents');
      expect(req.request.body).toEqual(request);
      req.flush({});
    });

    it('returns the response body', () => {
      const mockResponse: SubmitConsentResponse = {
        success: true,
        statusCode: 200,
        errorDetails: null,
      };

      let result: SubmitConsentResponse | undefined;
      service.submitConsent(request).subscribe(r => (result = r));

      httpMock.expectOne('/CustomerPortal/application/consents').flush(mockResponse);
      expect(result).toEqual(mockResponse);
    });
  });
});
