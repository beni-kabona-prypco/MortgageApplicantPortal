import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '@env/environment';

import { ConfigService } from '@core/config';
import { SdkStatus } from '@core/sdk';

import { DATADOG_RUM_SDK } from './datadog-rum.sdk';

const DEFAULT_SESSION_REPLAY_SAMPLE_RATE = 0;

/**
 * Wraps the Datadog RUM SDK so components and services can report errors and
 * custom actions through a typed surface — never touching the SDK directly.
 * Initialized once at app boot via `provideRum`; subsequent `init` calls are
 * no-ops.
 *
 * No user-identity methods — the buyer portal is unauthenticated.
 *
 * Kill switch: when `config.datadog.enabled === false` (or credentials are
 * missing) the service stays in `'disabled'` and every method is a no-op.
 */
@Injectable({ providedIn: 'root' })
export class RumService {
  private readonly sdk = inject(DATADOG_RUM_SDK);
  private readonly config = inject(ConfigService);
  private readonly _status = signal<SdkStatus>('idle');

  readonly status = this._status.asReadonly();
  readonly isReady = computed(() => this._status() === 'ready');

  init(): void {
    if (this._status() !== 'idle') {
      return;
    }

    const { applicationId, clientToken, service, env, enabled, sessionReplaySampleRate } =
      this.config.config.datadog;

    if (!enabled || !applicationId || !clientToken) {
      this._status.set('disabled');
      return;
    }

    this.sdk.init({
      applicationId,
      clientToken,
      service,
      env,
      version: environment.appVersion,
      sessionReplaySampleRate: sessionReplaySampleRate ?? DEFAULT_SESSION_REPLAY_SAMPLE_RATE,
    });
    this._status.set('ready');
  }

  addError(error: unknown, context?: Readonly<Record<string, unknown>>): void {
    if (this._status() !== 'ready') {
      return;
    }

    this.sdk.addError(error, context);
  }

  addAction(name: string, context?: Readonly<Record<string, unknown>>): void {
    if (this._status() !== 'ready') {
      return;
    }

    this.sdk.addAction(name, context);
  }
}
