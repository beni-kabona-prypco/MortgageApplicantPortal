import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { ApplicationCacheService } from '@core/application';

import type {
  GetBuyerApplicationResponse,
  GetCompaniesResponse,
  GetEmiratesResponse,
  GetWorkingIndustriesResponse,
  UpdateBuyerDetailsRequest,
  UpdateBuyerDetailsResponse,
  ValidateApplicationResponse,
} from './buyer-details.model';

@Injectable({ providedIn: 'root' })
export class BuyerDetailsService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(ApplicationCacheService);

  getApplication(applicationId: string) {
    return this.cache.get<GetBuyerApplicationResponse>(applicationId);
  }

  getEmirates() {
    return this.http.get<GetEmiratesResponse>('/Buyer/location-emirates');
  }

  getWorkingIndustries() {
    return this.http.get<GetWorkingIndustriesResponse>('/Buyer/working-industry');
  }

  searchCompanies(companyName: string) {
    return this.http.get<GetCompaniesResponse>('/Buyer/search-company', {
      params: { companyName },
    });
  }

  updateBuyerDetails(payload: UpdateBuyerDetailsRequest) {
    return this.http.put<UpdateBuyerDetailsResponse>('/Buyer/Application/', payload);
  }

  validateApplication(applicationId: string) {
    return this.http.get<ValidateApplicationResponse>('/Buyer/validate', {
      params: { applicationId },
    });
  }
}
