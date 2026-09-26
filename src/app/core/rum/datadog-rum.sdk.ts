import { InjectionToken } from '@angular/core';
import { datadogRum } from '@datadog/browser-rum';

import { DatadogRumSdk } from './rum.model';

const PRYPCO_ORIGIN_PATTERN = /^https:\/\/([a-z0-9-]+\.)*prypco\.com(?:[/?#]|$)/;

export const datadogRumFns = {
  init: datadogRum.init.bind(datadogRum),
  addError: datadogRum.addError.bind(datadogRum),
  addAction: datadogRum.addAction.bind(datadogRum),
};

/**
 * DI token holding the concrete Datadog RUM SDK. The default factory pins the
 * Prypco-standard init options (EU site, 100% session sample rate,
 * `mask-user-input` privacy, Prypco origin APM tracing). Override this token
 * in tests to avoid touching the real SDK.
 */
export const DATADOG_RUM_SDK = new InjectionToken<DatadogRumSdk>('DATADOG_RUM_SDK', {
  providedIn: 'root',
  factory: () => ({
    init: cfg =>
      datadogRumFns.init({
        applicationId: cfg.applicationId,
        clientToken: cfg.clientToken,
        site: 'datadoghq.eu',
        service: cfg.service,
        env: cfg.env,
        version: cfg.version,
        sessionSampleRate: 100,
        sessionReplaySampleRate: cfg.sessionReplaySampleRate,
        trackResources: true,
        trackUserInteractions: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
        allowedTracingUrls: [PRYPCO_ORIGIN_PATTERN],
        traceSampleRate: 100,
      }),
    addError: (error, context) => datadogRumFns.addError(error, context),
    addAction: (name, context) => datadogRumFns.addAction(name, context),
  }),
});
