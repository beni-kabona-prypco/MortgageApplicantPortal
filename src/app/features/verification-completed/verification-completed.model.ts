interface BrokerInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

interface BrokerageInfo {
  readonly id: string;
  readonly name: string;
  readonly logo: string;
}

export interface VerificationCompletedApplicationData {
  readonly id: string;
  readonly short_id: string;
  readonly status: string;
  readonly broker: BrokerInfo;
  readonly brokerage: BrokerageInfo;
}

export interface VerificationCompletedApplicationRecord {
  readonly id: string;
  readonly applicationData: VerificationCompletedApplicationData;
}

export interface GetVerificationCompletedApplicationResponse {
  readonly success: boolean;
  readonly data: VerificationCompletedApplicationRecord;
  readonly statusCode: number;
  readonly errorDetails: unknown;
}
