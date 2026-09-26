import { Injectable, inject, signal } from '@angular/core';
import { environment } from '@env/environment';

import { ConfigService } from '@core/config';
import { SdkStatus } from '@core/sdk';

import { DATADOG_LOGS_SDK } from './datadog-logs.sdk';

/**
 * Wraps the Datadog Logs SDK. Initialized once at app boot via `provideLogs`;
 * subsequent `init` calls are no-ops. The SDK auto-forwards `console.warn` /
 * `console.error` and uncaught errors — no per-call surface is needed.
 *
 * Kill switch: when `config.datadog.enabled === false` (or `clientToken` is
 * missing) the service stays in `'disabled'`.
 */
@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly sdk = inject(DATADOG_LOGS_SDK);
  private readonly config = inject(ConfigService);
  private readonly _status = signal<SdkStatus>('idle');

  readonly status = this._status.asReadonly();

  init(): void {
    if (this._status() !== 'idle') {
      return;
    }

    const { clientToken, service, env, enabled } = this.config.config.datadog;

    if (!enabled || !clientToken) {
      this._status.set('disabled');
      return;
    }

    this.sdk.init({
      clientToken,
      service,
      env,
      version: environment.appVersion,
    });
    this._status.set('ready');
  }
}
