import type { BrokerInfo, BrokerageInfo } from '@core/application';

export interface VerifyYourIdentityApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly broker: BrokerInfo;
  readonly brokerage: BrokerageInfo;
  readonly links?: {
    readonly eKyc?: {
      readonly redirectUrl?: string;
    };
  };
}

export interface VerifyYourIdentityApplicationRecord {
  readonly id: string;
  readonly applicationData: VerifyYourIdentityApplicationData;
}

export interface GetVerifyYourIdentityApplicationResponse {
  readonly success: boolean;
  readonly data: VerifyYourIdentityApplicationRecord;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}
