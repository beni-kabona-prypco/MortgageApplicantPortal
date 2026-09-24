import { Injectable, inject } from '@angular/core';
import { ToastService } from '@prypco/web-ui';

import { NOTIFICATION_APPEARANCE, NOTIFICATION_VARIANT } from './notification.constants';
import { NotificationConfig, NotificationLevel } from './notification.model';

/**
 * Headless notification channel. Report feedback via `success/info/warning/error`;
 * this façade maps each level onto the DS `ToastService` so there is a single
 * toast UI across the app. Keeping this seam lets the HTTP interceptor notify
 * without depending on a UI component directly.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toast = inject(ToastService);

  success(config: NotificationConfig): void {
    this.show('success', config);
  }

  info(config: NotificationConfig): void {
    this.show('info', config);
  }

  warning(config: NotificationConfig): void {
    this.show('warning', config);
  }

  error(config: NotificationConfig): void {
    this.show('error', config);
  }

  notify(config: NotificationConfig & { type: NotificationLevel }): void {
    this.show(config.type, config);
  }

  private show(level: NotificationLevel, config: NotificationConfig): void {
    const message = config.title ?? config.message;
    const supportingText =
      config.title && config.message !== config.title ? config.message : undefined;

    this.toast.show({
      message,
      supportingText,
      variant: NOTIFICATION_VARIANT[level],
      appearance: NOTIFICATION_APPEARANCE,
      ...(config.durationMs === undefined ? {} : { duration: config.durationMs }),
    });
  }
}
