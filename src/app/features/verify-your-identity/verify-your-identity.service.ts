import { inject, Injectable } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type { GetVerifyYourIdentityApplicationResponse } from './verify-your-identity.model';

@Injectable({ providedIn: 'root' })
export class VerifyYourIdentityService {
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.fetch<GetVerifyYourIdentityApplicationResponse>(applicationId);
  }
}
