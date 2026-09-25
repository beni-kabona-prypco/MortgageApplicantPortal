import { inject, Injectable } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type { GetVerificationCompletedApplicationResponse } from './verification-completed.model';

@Injectable({ providedIn: 'root' })
export class VerificationCompletedService {
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.get<GetVerificationCompletedApplicationResponse>(applicationId);
  }
}
