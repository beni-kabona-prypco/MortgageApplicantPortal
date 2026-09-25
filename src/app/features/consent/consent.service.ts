import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type {
  GetConsentApplicationResponse,
  SubmitConsentRequest,
  SubmitConsentResponse,
} from './consent.model';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.get<GetConsentApplicationResponse>(applicationId);
  }

  getApplicationFresh(applicationId: string) {
    this.cache.invalidate(applicationId);
    return this.cache.get<GetConsentApplicationResponse>(applicationId);
  }

  submitConsent(request: SubmitConsentRequest) {
    return this.http.put<SubmitConsentResponse>('/CustomerPortal/application/consents', request);
  }
}
