export const KFS_EVENTS = {
  KFS_OPENED: 'User_KFS_Opened',
  VIEWED_DOCUMENT: 'User_Viewed_KFS_Document',
  CONFIRMED: 'User_KFS_Confirmed',
  KFS_ACCEPTED: 'mo_KFS_accepted',
  THANKYOU_PAGE: 'Thankyou_Page_after_KFS_acceptance',
} as const;

export const KFS_POLL_INTERVAL_MS = 5000;
export const KFS_POLL_MAX_ATTEMPTS = 12;
