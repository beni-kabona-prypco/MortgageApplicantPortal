import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type { AcceptKfsRequest, AcceptKfsResponse, GetKfsApplicationResponse } from './kfs.model';

@Injectable({ providedIn: 'root' })
export class KfsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.get<GetKfsApplicationResponse>(applicationId);
  }

  pollApplication(applicationId: string) {
    return this.cache.fetch<GetKfsApplicationResponse>(applicationId);
  }

  acceptKfs(request: AcceptKfsRequest) {
    return this.http.post<AcceptKfsResponse>('/Customer/acceptKFS', request);
  }
}
