import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type {
  GetConsentApplicationResponse,
  SubmitConsentRequest,
  SubmitConsentResponse,
} from './consent.model';

@Injectable({ providedIn: 'root' })
export class ConsentService {
  private readonly http = inject(HttpClient);

  getApplication(applicationId: string) {
    return this.http.get<GetConsentApplicationResponse>(`/Buyer/Application/${applicationId}`);
  }

  submitConsent(request: SubmitConsentRequest) {
    return this.http.put<SubmitConsentResponse>('/CustomerPortal/application/consents', request);
  }
}
