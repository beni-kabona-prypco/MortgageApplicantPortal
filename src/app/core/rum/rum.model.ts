/** Init parameters routed to `datadogRum.init` from the runtime config. */
export interface DatadogRumInitConfig {
  readonly applicationId: string;
  readonly clientToken: string;
  readonly service: string;
  readonly env: string;
  readonly version: string;
  /** Percentage of sessions recorded by Session Replay (0–100). */
  readonly sessionReplaySampleRate: number;
}

/**
 * Minimal shape of the Datadog RUM SDK that `RumService` consumes. Kept narrow
 * on purpose so tests can supply a `jasmine.createSpyObj` mock via the
 * `DATADOG_RUM_SDK` token.
 *
 * No user-identity methods — the buyer portal is unauthenticated.
 */
export interface DatadogRumSdk {
  init(config: DatadogRumInitConfig): void;
  addError(error: unknown, context?: Readonly<Record<string, unknown>>): void;
  addAction(name: string, context?: Readonly<Record<string, unknown>>): void;
}
