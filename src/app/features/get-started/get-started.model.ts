export interface BrokerInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

export interface BrokerageInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

export interface ApplicantInfo {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly businessEmail?: string;
}

interface ConsentEntry {
  readonly accepted: boolean;
  readonly timestamp: number;
}

interface Consents {
  readonly tnc: ConsentEntry;
  readonly bureau: ConsentEntry;
  readonly dataAccuracy: ConsentEntry;
}

export interface ApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly status: string;
  readonly broker: BrokerInfo;
  readonly brokerage: BrokerageInfo;
  readonly applicants: readonly ApplicantInfo[];
  readonly consents: Consents | null;
  readonly links: {
    readonly eKyc: {
      readonly redirectUrl: string;
    };
  };
}

export interface ApplicationRecord {
  readonly id: string;
  readonly applicationData: ApplicationData;
}

export interface GetApplicationResponse {
  readonly success: boolean;
  readonly data: ApplicationRecord;
  readonly statusCode: number;
  readonly timestamp: string;
  readonly errorDetails: unknown;
}
