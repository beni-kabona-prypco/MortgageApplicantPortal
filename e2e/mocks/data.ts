export const APP_ID = 'test-app-001';

const broker = { id: 'broker-1', name: 'Test Broker', logo: '' };
const brokerage = { id: 'brokerage-1', name: 'Test Brokerage', logo: '' };

const baseApplicationData = {
  id: APP_ID,
  short_id: 'IM-0001',
  status: 'Pending',
  version: 'v1',
  broker,
  brokerage,
  applicants: [
    {
      id: 'applicant-1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      mobile: '+971501234567',
      salary: 20000,
    },
  ],
  consents: null,
  links: { eKyc: { redirectUrl: 'https://kyc.example.com/verify' } },
};

export const mockApplicationResponse = {
  success: true,
  data: { id: APP_ID, version: 1, applicationData: baseApplicationData },
  statusCode: 200,
  timestamp: '2024-01-01T00:00:00.000Z',
  errorDetails: null,
};

// Fully-prefilled applicant — all required buyer-details fields present.
export const mockFullApplicationResponse = {
  ...mockApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: {
      ...baseApplicationData,
      applicants: [
        {
          id: 'applicant-1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          mobile: '+971501234567',
          salary: 20000,
          businessEmail: 'jane.doe@company.com',
          workingIndustry: 'finance',
          companyDetails: { name: 'Test Company', joiningMonth: 3, joiningYear: 2021 },
          address: {
            homeAddress: '123 Main Street',
            villaOrApartmentNumber: 'Apt 4B',
            buildingOrCommunity: 'Marina Heights',
            area: 'Dubai Marina',
            emirate: 'Dubai',
          },
        },
      ],
    },
  },
};

// Status in TERMINAL_STATUSES — triggers desktop polling success state and mobile auto-nav.
export const mockTerminalApplicationResponse = {
  ...mockApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: { ...baseApplicationData, status: 'In progress' },
  },
};

// Status in INELIGIBLE_STATUSES — verification-completed shows "Thank you for applying!".
export const mockIneligibleApplicationResponse = {
  ...mockApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: { ...baseApplicationData, status: 'Client not eligible' },
  },
};

// Full applicant data with no eKYC URL — all required buyer-details fields filled,
// but consent submit still navigates within the SPA (to buyer-details) instead of redirecting.
export const mockFullApplicationNoEKycResponse = {
  ...mockFullApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: {
      ...mockFullApplicationResponse.data.applicationData,
      links: { eKyc: { redirectUrl: '' } },
    },
  },
};

// No eKYC redirect URL — consent submit navigates to buyer-details instead of redirecting.
export const mockApplicationNoEKycResponse = {
  ...mockApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: {
      ...baseApplicationData,
      links: { eKyc: { redirectUrl: '' } },
    },
  },
};

// KFS status without document — poll still in progress.
export const mockKfsApplicationResponse = {
  ...mockApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: { ...baseApplicationData, status: 'KFS Pending' },
  },
};

// Minimal valid single-page PDF encoded as a data URL for the PDF viewer + download tests.
const MINIMAL_PDF_B64 =
  'JVBERi0xLjAKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5k' +
  'b2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4K' +
  'ZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3gg' +
  'WzAgMCA2MTIgNzkyXSA+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAow' +
  'MDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBu' +
  'IAp0cmFpbGVyCjw8IC9TaXplIDQgL1Jvb3QgMSAwIFIgPj4Kc3RhcnR4cmVmCjE5MgolJUVPRg==';

export const MOCK_KFS_DOCUMENT = {
  document: `data:application/pdf;base64,${MINIMAL_PDF_B64}`,
  bankKey: 'TestBank',
  offerId: 'offer-001',
};

// KFS status with document ready — poll completes immediately.
export const mockKfsReadyApplicationResponse = {
  ...mockKfsApplicationResponse,
  data: {
    id: APP_ID,
    version: 1,
    applicationData: {
      ...mockKfsApplicationResponse.data.applicationData,
      kfs: MOCK_KFS_DOCUMENT,
    },
  },
};
