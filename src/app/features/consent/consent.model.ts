interface BrokerNavInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

interface BrokerageNavInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

export interface ConsentApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly broker: BrokerNavInfo;
  readonly brokerage: BrokerageNavInfo;
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

export interface SubmitConsentRequest {
  readonly externalId: string;
  readonly bureau: boolean;
  readonly tnc: boolean;
  readonly dataAccuracy: boolean;
}

export interface SubmitConsentResponse {
  readonly success: boolean;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}
