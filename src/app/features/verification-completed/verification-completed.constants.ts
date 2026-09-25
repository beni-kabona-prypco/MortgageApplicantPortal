export const VERIFICATION_COMPLETED_EVENTS = {
  VERIFICATION_COMPLETED: 'User_Verificationcompleted',
  VERIFICATION_FAILED: 'User_verificationFailed',
} as const;

export const INELIGIBLE_STATUSES = new Set([
  'Rejected',
  'No match',
  'Bank Onboarding Rejected',
  'Expired',
  'No offers available',
  'Client not eligible',
]);
