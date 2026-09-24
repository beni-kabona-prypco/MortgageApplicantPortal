import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GetStartedService } from './get-started.service';
import type { GetApplicationResponse } from './get-started.model';

const applicationId = 'abc-123';

const mockResponse: GetApplicationResponse = {
  success: true,
  data: {
    id: applicationId,
    applicationData: {
      id: applicationId,
      short_id: 'SHORT1',
      status: 'Pending',
      broker: { id: 'b1', name: 'Test Broker', logo: '' },
      brokerage: { id: 'br1', name: 'Test Brokerage', logo: 'https://logo.example.com/logo.png' },
      applicants: [{ id: 'a1', firstName: 'John', lastName: 'Doe' }],
      consents: null,
      links: { eKyc: { redirectUrl: 'https://kyc.example.com' } },
    },
  },
  statusCode: 200,
  timestamp: '2024-01-01T00:00:00Z',
  errorDetails: null,
};

describe('GetStartedService', () => {
  let service: GetStartedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetStartedService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(GetStartedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('calls GET /Buyer/Application/:id', () => {
    service.getApplication(applicationId).subscribe();

    const req = httpMock.expectOne(`/Buyer/Application/${applicationId}`);

    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('returns the full response body', () => {
    let result: GetApplicationResponse | undefined;

    service.getApplication(applicationId).subscribe(res => {
      result = res;
    });

    httpMock.expectOne(`/Buyer/Application/${applicationId}`).flush(mockResponse);

    expect(result).toEqual(mockResponse);
  });

  it('uses the provided applicationId in the URL', () => {
    const otherId = 'xyz-789';

    service.getApplication(otherId).subscribe();

    const req = httpMock.expectOne(`/Buyer/Application/${otherId}`);

    expect(req.request.url).toContain(otherId);

    req.flush(mockResponse);
  });
});
