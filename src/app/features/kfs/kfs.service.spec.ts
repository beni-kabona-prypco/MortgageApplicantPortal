import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { AcceptKfsRequest, AcceptKfsResponse, GetKfsApplicationResponse } from './kfs.model';
import { KfsService } from './kfs.service';

const APP_ID = 'app-kfs-123';

function makeKfsResponse(hasDocument: boolean): GetKfsApplicationResponse {
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
        brokerage: { id: 'bg1', name: 'Brokerage A', logo: '' },
        ...(hasDocument
          ? { kfs: { document: 'https://example.com/kfs.pdf', bankKey: 'FIRST', offerId: 'o1' } }
          : {}),
      },
    },
  };
}

describe('KfsService', () => {
  let service: KfsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KfsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(KfsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getApplication ──────────────────────────────────────────────────────────

  describe('getApplication()', () => {
    it('GETs /Buyer/Application/:id', () => {
      service.getApplication(APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('returns the response body', () => {
      const mock = makeKfsResponse(true);
      let result: GetKfsApplicationResponse | undefined;

      service.getApplication(APP_ID).subscribe(r => (result = r));
      httpMock.expectOne(`/Buyer/Application/${APP_ID}`).flush(mock);

      expect(result).toEqual(mock);
    });
  });

  // ── pollApplication ─────────────────────────────────────────────────────────

  describe('pollApplication()', () => {
    it('GETs /Buyer/Application/:id', () => {
      service.pollApplication(APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('fetches fresh even when cache is warm', () => {
      service.getApplication(APP_ID).subscribe();
      httpMock.expectOne(`/Buyer/Application/${APP_ID}`).flush(makeKfsResponse(false));

      service.pollApplication(APP_ID).subscribe();
      const req = httpMock.expectOne(`/Buyer/Application/${APP_ID}`);
      expect(req.request.method).toBe('GET');
      req.flush(makeKfsResponse(true));
    });

    it('returns the response body', () => {
      const mock = makeKfsResponse(true);
      let result: GetKfsApplicationResponse | undefined;

      service.pollApplication(APP_ID).subscribe(r => (result = r));
      httpMock.expectOne(`/Buyer/Application/${APP_ID}`).flush(mock);

      expect(result).toEqual(mock);
    });
  });

  // ── acceptKfs ───────────────────────────────────────────────────────────────

  describe('acceptKfs()', () => {
    const request: AcceptKfsRequest = { applicationID: APP_ID };

    it('POSTs to /Customer/acceptKFS', () => {
      service.acceptKfs(request).subscribe();
      const req = httpMock.expectOne('/Customer/acceptKFS');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });

    it('sends applicationID in the request body', () => {
      service.acceptKfs(request).subscribe();
      const req = httpMock.expectOne('/Customer/acceptKFS');
      expect(req.request.body).toEqual(request);
      req.flush({});
    });

    it('returns the response body', () => {
      const mockResponse: AcceptKfsResponse = {
        success: true,
        statusCode: 200,
        errorDetails: null,
        data: { status: 'KFS_Accepted', message: 'Success' },
      };
      let result: AcceptKfsResponse | undefined;

      service.acceptKfs(request).subscribe(r => (result = r));
      httpMock.expectOne('/Customer/acceptKFS').flush(mockResponse);

      expect(result).toEqual(mockResponse);
    });
  });
});
