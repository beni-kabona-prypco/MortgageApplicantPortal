export interface WorkingIndustry {
  readonly id: string;
  readonly code: string;
  readonly label: string;
}

export interface BuyerAddress {
  readonly homeAddress: string;
  readonly villaOrApartmentNumber: string;
  readonly buildingOrCommunity: string;
  readonly area: string;
  readonly emirate: string;
}

export interface BuyerCompanyDetails {
  readonly name: string;
  readonly joiningMonth: number;
  readonly joiningYear: number;
}

export interface BuyerApplicant {
  readonly id?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly email?: string;
  readonly mobile?: string;
  readonly salary?: number;
  readonly businessEmail?: string;
  readonly companyName?: string;
  readonly workingIndustry?: string;
  readonly address?: BuyerAddress;
  readonly companyDetails?: BuyerCompanyDetails;
}

export interface AdditionalFinancialData {
  readonly annualRentalIncome?: number;
  readonly annualBonus?: number;
  readonly annualComission?: number;
  readonly housingRentalAllowance?: number;
  readonly annualVariableAllowance?: number;
  readonly monthlyExpenses?: {
    readonly lifestyle?: number;
    readonly nonBankingBorrowing?: number;
  };
}

export interface BuyerApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly status: string;
  readonly version?: string;
  readonly broker: { readonly id: string; readonly name: string; readonly logo: string };
  readonly brokerage: { readonly id: string; readonly name: string; readonly logo: string };
  readonly applicants: readonly BuyerApplicant[];
  readonly consents?: unknown;
  readonly links: { readonly eKyc: { readonly redirectUrl: string } };
  readonly additionalFinancialData?: AdditionalFinancialData;
}

export interface GetBuyerApplicationResponse {
  readonly success: boolean;
  readonly data: {
    readonly id: string;
    readonly applicationData: BuyerApplicationData;
    readonly version: number;
  };
  readonly statusCode: number;
  readonly errorDetails: unknown;
}

export interface GetEmiratesResponse {
  readonly success: boolean;
  readonly data: { readonly emirates: readonly string[] };
}

export interface GetWorkingIndustriesResponse {
  readonly success: boolean;
  readonly data: { readonly workingIndustries: readonly WorkingIndustry[] };
}

export interface GetCompaniesResponse {
  readonly success: boolean;
  readonly data: { readonly companies: readonly string[] };
}

export interface UpdateBuyerDetailsRequest {
  readonly applicationId: string;
  readonly applicationData: BuyerApplicationData;
  readonly version: number;
}

export interface UpdateBuyerDetailsResponse {
  readonly success: boolean;
  readonly data: { readonly applicationId: string };
  readonly statusCode: number;
  readonly errorDetails: unknown;
}

export interface ValidateApplicationResponse {
  readonly success: boolean;
  readonly data: { readonly isVerified: boolean };
  readonly statusCode: number;
  readonly errorDetails: unknown;
}

export interface BuyerDetailsFormFields {
  readonly email: string;
  readonly businessEmail: string;
  readonly salary: string;
  readonly companyName: string;
  readonly workingIndustry: string;
  readonly joiningMonth: string;
  readonly joiningYear: string;
  readonly homeAddress: string;
  readonly villaOrApartmentNumber: string;
  readonly buildingOrCommunity: string;
  readonly area: string;
  readonly emirate: string;
  readonly annualRentalIncome: string;
  readonly annualBonus: string;
  readonly annualCommission: string;
  readonly housingRentalAllowance: string;
  readonly annualVariableAllowance: string;
  readonly lifestyleExpenses: string;
  readonly nonBankingBorrowing: string;
}
