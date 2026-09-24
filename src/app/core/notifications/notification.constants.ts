import type { ToastAppearance, ToastVariant } from '@prypco/web-ui';

import { NotificationLevel } from './notification.model';

export const NOTIFICATION_VARIANT: Record<NotificationLevel, ToastVariant> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

export const NOTIFICATION_APPEARANCE: ToastAppearance = 'alert';
