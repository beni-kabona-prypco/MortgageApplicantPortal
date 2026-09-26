import type { BrokerInfo, BrokerageInfo } from '@core/application';

export interface KfsDocument {
  readonly document: string;
  readonly bankKey: string;
  readonly offerId: string;
}

export interface KfsApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly broker: BrokerInfo;
  readonly brokerage: BrokerageInfo;
  readonly kfs?: KfsDocument;
}

export interface KfsApplicationRecord {
  readonly id: string;
  readonly applicationData: KfsApplicationData;
}

export interface GetKfsApplicationResponse {
  readonly success: boolean;
  readonly data: KfsApplicationRecord;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}

export interface AcceptKfsRequest {
  readonly applicationID: string;
}

export interface AcceptKfsResponse {
  readonly success: boolean;
  readonly data: {
    readonly status: string;
    readonly message: string;
  };
  readonly statusCode: number;
  readonly errorDetails: unknown;
}
