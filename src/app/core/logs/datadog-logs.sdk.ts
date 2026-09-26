import { InjectionToken } from '@angular/core';
import { datadogLogs } from '@datadog/browser-logs';

import { DatadogLogsSdk } from './logs.model';

export const datadogLogsFns = {
  init: datadogLogs.init.bind(datadogLogs),
};

/**
 * DI token holding the concrete Datadog Logs SDK. The default factory pins the
 * Prypco-standard init options (EU site, 100% sample rate, console warn/error
 * forwarding, network + runtime error forwarding). Override this token in tests
 * to avoid touching the real SDK.
 */
export const DATADOG_LOGS_SDK = new InjectionToken<DatadogLogsSdk>('DATADOG_LOGS_SDK', {
  providedIn: 'root',
  factory: () => ({
    init: cfg =>
      datadogLogsFns.init({
        clientToken: cfg.clientToken,
        site: 'datadoghq.eu',
        service: cfg.service,
        env: cfg.env,
        version: cfg.version,
        forwardConsoleLogs: ['warn', 'error'],
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
      }),
  }),
});
