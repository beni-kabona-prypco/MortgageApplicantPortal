import { InjectionToken, inject } from '@angular/core';
import { ConfigService } from './config.service';

export interface AppConfig {
  readonly apiBaseUrl: string;
  readonly ory: OryConfig;
  /** Amplitude product-analytics SDK settings. */
  readonly amplitude: AmplitudeConfig;
  /** Datadog RUM + Logs SDK settings. */
  readonly datadog: DatadogConfig;
  /**
   * Hotjar session-recording settings. Optional so deployed `config.json`
   * files that predate this key don't break on boot — the HotjarService
   * treats absence the same as `enabled: false`.
   */
  readonly hotjar?: HotjarConfig;
}

export interface OryConfig {
  readonly baseUrl: string;
}

/**
 * Amplitude SDK runtime settings. Set `enabled: false` (or leave `apiKey` empty)
 * to disable the SDK — `track` becomes a no-op. Doubles as the kill switch for
 * local dev and incident response.
 */
export interface AmplitudeConfig {
  readonly apiKey: string;
  readonly enabled: boolean;
}

/**
 * Datadog RUM + Logs runtime settings. Set `enabled: false` (or leave
 * credentials empty) to disable both SDKs — useful for local dev and
 * incident response without a rebuild.
 */
export interface DatadogConfig {
  readonly applicationId: string;
  readonly clientToken: string;
  readonly service: string;
  readonly env: string;
  readonly enabled: boolean;
  /**
   * Percentage of sessions recorded by Session Replay (0–100). Separate
   * from `enabled` so RUM metrics and errors stay on at 100% while replay
   * is sampled down per environment.
   */
  readonly sessionReplaySampleRate?: number;
}

export interface HotjarConfig {
  readonly siteId: string;
  readonly enabled: boolean;
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => inject(ConfigService).config.apiBaseUrl,
});
