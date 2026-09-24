import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { GetApplicationResponse } from './get-started.model';

@Injectable({ providedIn: 'root' })
export class GetStartedService {
  private readonly http = inject(HttpClient);

  getApplication(applicationId: string) {
    return this.http.get<GetApplicationResponse>(`/Buyer/Application/${applicationId}`);
  }
}
