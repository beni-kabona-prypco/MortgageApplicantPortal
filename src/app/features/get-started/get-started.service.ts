import { inject, Injectable } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type { GetApplicationResponse } from './get-started.model';

@Injectable({ providedIn: 'root' })
export class GetStartedService {
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.get<GetApplicationResponse>(applicationId);
  }

  pollApplication(applicationId: string) {
    return this.cache.fetch<GetApplicationResponse>(applicationId);
  }
}
