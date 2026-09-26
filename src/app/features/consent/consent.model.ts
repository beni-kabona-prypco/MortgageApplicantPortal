import type { BrokerInfo, BrokerageInfo } from '@core/application';

export interface ConsentApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly broker: BrokerInfo;
  readonly brokerage: BrokerageInfo;
  readonly links: {
    readonly eKyc: {
      readonly redirectUrl: string;
    };
  };
}

export interface ConsentApplicationRecord {
  readonly id: string;
  readonly applicationData: ConsentApplicationData;
}

export interface GetConsentApplicationResponse {
  readonly success: boolean;
  readonly data: ConsentApplicationRecord;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}

export interface TncSection {
  readonly heading?: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly string[];
}

export interface ConsentItem {
  readonly accepted: boolean;
  readonly timestamp: number;
}

export interface SubmitConsentRequest {
  readonly externalId: string;
  readonly bureau: ConsentItem;
  readonly tnc: ConsentItem;
  readonly dataAccuracy: ConsentItem;
  readonly request: ConsentItem;
}

export interface SubmitConsentResponse {
  readonly success: boolean;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}
