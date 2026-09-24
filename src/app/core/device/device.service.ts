import { Injectable } from '@angular/core';

/**
 * User-agent based device detection. Use for analytics platform tagging only.
 * For UI layout decisions, use ViewportService instead.
 */
@Injectable({ providedIn: 'root' })
export class DeviceService {
  isMobile(): boolean {
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        window.navigator.userAgent.toLowerCase()
      );
    }

    return false;
  }
}
