export const VERIFICATION_COMPLETED_EVENTS = {
  VERIFICATION_COMPLETED: 'User_Verificationcompleted',
  VERIFICATION_FAILED: 'User_verificationFailed',
  THANKYOU_PAGE: 'Thankyou_Page_after_KFS_acceptance',
} as const;

export const KFS_POST_STATUSES = new Set([
  'Offer selected',
  'Awaiting Customer Signature',
  'AIP Letter Ready',
]);

export const INELIGIBLE_STATUSES = new Set([
  'Rejected',
  'No match',
  'Bank Onboarding Rejected',
  'Expired',
  'No offers available',
  'Client not eligible',
]);
