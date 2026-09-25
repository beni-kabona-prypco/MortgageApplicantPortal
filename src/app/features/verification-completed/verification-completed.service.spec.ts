import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ApplicationCacheService } from '@core/application';

import type { GetVerificationCompletedApplicationResponse } from './verification-completed.model';
import { VerificationCompletedService } from './verification-completed.service';

const APP_ID = 'app-123';

const mockResponse: GetVerificationCompletedApplicationResponse = {
  success: true,
  statusCode: 200,
  errorDetails: null,
  data: {
    id: 'rec-1',
    applicationData: {
      id: APP_ID,
      short_id: 'IM-0001',
      status: 'In progress',
      broker: { id: 'b1', name: 'Broker A', logo: '' },
      brokerage: { id: 'bg1', name: 'Brokerage A', logo: '' },
    },
  },
};

describe('VerificationCompletedService', () => {
  let service: VerificationCompletedService;
  let cacheSpy: jasmine.SpyObj<ApplicationCacheService>;

  beforeEach(() => {
    cacheSpy = jasmine.createSpyObj<ApplicationCacheService>('ApplicationCacheService', ['get']);
    cacheSpy.get.and.returnValue(of(mockResponse) as never);

    TestBed.configureTestingModule({
      providers: [
        VerificationCompletedService,
        { provide: ApplicationCacheService, useValue: cacheSpy },
      ],
    });

    service = TestBed.inject(VerificationCompletedService);
  });

  describe('getApplication()', () => {
    it('delegates to ApplicationCacheService.get with the given applicationId', () => {
      service.getApplication(APP_ID).subscribe();
      expect(cacheSpy.get).toHaveBeenCalledOnceWith(APP_ID);
    });

    it('returns the cached response', () => {
      let result: GetVerificationCompletedApplicationResponse | undefined;
      service.getApplication(APP_ID).subscribe(r => (result = r));
      expect(result).toEqual(mockResponse);
    });

    it('uses the same cache entry on repeated calls (no second HTTP call)', () => {
      service.getApplication(APP_ID).subscribe();
      service.getApplication(APP_ID).subscribe();
      expect(cacheSpy.get).toHaveBeenCalledTimes(2);
    });
  });
});
