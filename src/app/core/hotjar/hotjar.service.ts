import { Injectable, inject, signal } from '@angular/core';

import { ConfigService } from '@core/config';
import { SdkStatus } from '@core/sdk';

import { HOTJAR_SDK } from './hotjar.sdk';

/**
 * Manages the Hotjar session-recording SDK lifecycle. Initialized once at app
 * boot via `provideHotjar`; subsequent `init` calls are no-ops.
 *
 * Kill switch: when `config.hotjar` is absent, `enabled` is false, or `siteId`
 * is empty the service enters `'disabled'` and the SDK is never loaded.
 */
@Injectable({ providedIn: 'root' })
export class HotjarService {
  private readonly sdk = inject(HOTJAR_SDK);
  private readonly config = inject(ConfigService);
  private readonly _status = signal<SdkStatus>('idle');

  readonly status = this._status.asReadonly();

  init(): void {
    if (this._status() !== 'idle') {
      return;
    }

    const hotjar = this.config.config.hotjar;

    if (!hotjar?.enabled || !hotjar.siteId) {
      this._status.set('disabled');
      return;
    }

    this.sdk.init(hotjar.siteId);
    this._status.set('ready');
  }
}
