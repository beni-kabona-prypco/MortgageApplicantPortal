import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type {
  GetBuyerApplicationResponse,
  GetCompaniesResponse,
  GetEmiratesResponse,
  GetWorkingIndustriesResponse,
  UpdateBuyerDetailsRequest,
  UpdateBuyerDetailsResponse,
  ValidateApplicationResponse,
} from './buyer-details.model';
import { BuyerDetailsService } from './buyer-details.service';

const APP_ID = 'app-abc-123';

const mockAppResponse: GetBuyerApplicationResponse = {
  success: true,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: {
      id: APP_ID,
      short_id: 'IM-0001',
      status: 'Pending',
      broker: { id: 'b1', name: 'Test Broker', logo: '' },
      brokerage: { id: 'br1', name: 'Test Brokerage', logo: '' },
      applicants: [],
      links: { eKyc: { redirectUrl: 'https://kyc.example.com' } },
    },
  },
  statusCode: 200,
  errorDetails: null,
};

describe('BuyerDetailsService', () => {
  let service: BuyerDetailsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuyerDetailsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BuyerDetailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── getApplication ─────────────────────────────────────────────────────────

  describe('getApplication()', () => {
    it('calls GET /Buyer/Application/:id', () => {
      service.getApplication(APP_ID).subscribe();

      const req = httpMock.expectOne(`/Buyer/Application/${APP_ID}`);

      expect(req.request.method).toBe('GET');
      req.flush(mockAppResponse);
    });

    it('returns the full response body', () => {
      let result: GetBuyerApplicationResponse | undefined;

      service.getApplication(APP_ID).subscribe(res => {
        result = res;
      });

      httpMock.expectOne(`/Buyer/Application/${APP_ID}`).flush(mockAppResponse);

      expect(result).toEqual(mockAppResponse);
    });
  });

  // ── getEmirates ────────────────────────────────────────────────────────────

  describe('getEmirates()', () => {
    it('calls GET /Buyer/location-emirates', () => {
      service.getEmirates().subscribe();

      const req = httpMock.expectOne('/Buyer/location-emirates');

      expect(req.request.method).toBe('GET');

      const response: GetEmiratesResponse = {
        success: true,
        data: { emirates: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
      };

      req.flush(response);
    });

    it('returns the emirates list', () => {
      let result: GetEmiratesResponse | undefined;

      service.getEmirates().subscribe(res => {
        result = res;
      });

      const response: GetEmiratesResponse = {
        success: true,
        data: { emirates: ['Dubai', 'Abu Dhabi'] },
      };

      httpMock.expectOne('/Buyer/location-emirates').flush(response);

      expect(result?.data.emirates).toEqual(['Dubai', 'Abu Dhabi']);
    });
  });

  // ── getWorkingIndustries ───────────────────────────────────────────────────

  describe('getWorkingIndustries()', () => {
    it('calls GET /Buyer/working-industry', () => {
      service.getWorkingIndustries().subscribe();

      const req = httpMock.expectOne('/Buyer/working-industry');

      expect(req.request.method).toBe('GET');

      const response: GetWorkingIndustriesResponse = {
        success: true,
        data: { workingIndustries: [{ id: '1', code: 'tech', label: 'Technology' }] },
      };

      req.flush(response);
    });

    it('returns the industries list', () => {
      let result: GetWorkingIndustriesResponse | undefined;

      service.getWorkingIndustries().subscribe(res => {
        result = res;
      });

      const response: GetWorkingIndustriesResponse = {
        success: true,
        data: { workingIndustries: [{ id: '1', code: 'fin', label: 'Finance' }] },
      };

      httpMock.expectOne('/Buyer/working-industry').flush(response);

      expect(result?.data.workingIndustries[0].code).toBe('fin');
    });
  });

  // ── searchCompanies ────────────────────────────────────────────────────────

  describe('searchCompanies()', () => {
    it('calls GET /Buyer/search-company with companyName param', () => {
      service.searchCompanies('ACME').subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/Buyer/search-company' && r.params.get('companyName') === 'ACME'
      );

      expect(req.request.method).toBe('GET');

      const response: GetCompaniesResponse = {
        success: true,
        data: { companies: ['ACME Corp', 'ACME Ltd'] },
      };

      req.flush(response);
    });

    it('returns the companies list', () => {
      let result: GetCompaniesResponse | undefined;

      service.searchCompanies('test').subscribe(res => {
        result = res;
      });

      const response: GetCompaniesResponse = {
        success: true,
        data: { companies: ['Test Co'] },
      };

      httpMock
        .expectOne(r => r.url === '/Buyer/search-company' && r.params.get('companyName') === 'test')
        .flush(response);

      expect(result?.data.companies).toEqual(['Test Co']);
    });
  });

  // ── updateBuyerDetails ─────────────────────────────────────────────────────

  describe('updateBuyerDetails()', () => {
    it('calls PUT /Buyer/Application/ with the payload', () => {
      const payload: UpdateBuyerDetailsRequest = {
        applicationId: APP_ID,
        applicationData: mockAppResponse.data.applicationData,
        version: 1,
      };

      service.updateBuyerDetails(payload).subscribe();

      const req = httpMock.expectOne('/Buyer/Application/');

      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);

      const response: UpdateBuyerDetailsResponse = {
        success: true,
        data: { applicationId: APP_ID },
        statusCode: 200,
        errorDetails: null,
      };

      req.flush(response);
    });
  });

  // ── validateApplication ────────────────────────────────────────────────────

  describe('validateApplication()', () => {
    it('calls GET /Buyer/validate with applicationId param', () => {
      service.validateApplication(APP_ID).subscribe();

      const req = httpMock.expectOne(
        r => r.url === '/Buyer/validate' && r.params.get('applicationId') === APP_ID
      );

      expect(req.request.method).toBe('GET');

      const response: ValidateApplicationResponse = {
        success: true,
        data: { isVerified: true },
        statusCode: 200,
        errorDetails: null,
      };

      req.flush(response);
    });
  });
});
