/** Init parameters routed to `datadogLogs.init` from the runtime config. */
export interface DatadogLogsInitConfig {
  readonly clientToken: string;
  readonly service: string;
  readonly env: string;
  readonly version: string;
}

/**
 * Minimal shape of the Datadog Logs SDK that `LogsService` consumes. Kept
 * narrow on purpose so tests can supply a `jasmine.createSpyObj` mock via the
 * `DATADOG_LOGS_SDK` token. The SDK auto-forwards `console.warn` /
 * `console.error` and uncaught errors once initialized.
 */
export interface DatadogLogsSdk {
  init(config: DatadogLogsInitConfig): void;
}
