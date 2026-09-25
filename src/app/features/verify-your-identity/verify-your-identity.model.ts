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

export interface VerifyYourIdentityApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly broker: BrokerNavInfo;
  readonly brokerage: BrokerageNavInfo;
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
