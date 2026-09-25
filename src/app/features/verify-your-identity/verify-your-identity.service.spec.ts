import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApplicationCacheService } from '@core/application';

import type { GetVerifyYourIdentityApplicationResponse } from './verify-your-identity.model';
import { VerifyYourIdentityService } from './verify-your-identity.service';

const APP_ID = 'app-123';

const mockResponse: GetVerifyYourIdentityApplicationResponse = {
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
      links: { eKyc: { redirectUrl: 'https://ekyc.example.com/verify' } },
    },
  },
};

describe('VerifyYourIdentityService', () => {
  let service: VerifyYourIdentityService;
  let cacheSpy: jasmine.SpyObj<ApplicationCacheService>;

  beforeEach(() => {
    cacheSpy = jasmine.createSpyObj<ApplicationCacheService>('ApplicationCacheService', ['fetch']);
    cacheSpy.fetch.and.returnValue(of(mockResponse) as never);

    TestBed.configureTestingModule({
      providers: [
        VerifyYourIdentityService,
        { provide: ApplicationCacheService, useValue: cacheSpy },
      ],
    });

    service = TestBed.inject(VerifyYourIdentityService);
  });

  describe('getApplication()', () => {
    it('delegates to ApplicationCacheService.fetch with the given applicationId', () => {
      service.getApplication(APP_ID).subscribe();
      expect(cacheSpy.fetch).toHaveBeenCalledOnceWith(APP_ID);
    });

    it('returns the response', () => {
      let result: GetVerifyYourIdentityApplicationResponse | undefined;
      service.getApplication(APP_ID).subscribe(r => (result = r));
      expect(result).toEqual(mockResponse);
    });

    it('makes a fresh HTTP call on each invocation (no shared cache)', () => {
      service.getApplication(APP_ID).subscribe();
      service.getApplication(APP_ID).subscribe();
      expect(cacheSpy.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
