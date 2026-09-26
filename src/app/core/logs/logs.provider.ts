import {
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { ConfigService } from '@core/config';

import { LogsService } from './logs.service';

/**
 * Initializes the Datadog Logs SDK at app boot. Waits for the runtime config
 * to be loaded (via `ConfigService.whenLoaded`) before calling `init` — Angular
 * fires all `provideAppInitializer` callbacks in parallel, so relying on order
 * alone would race the `provideAppConfig` HTTP fetch.
 *
 * Register once in the root ApplicationConfig, after `provideAppConfig()`.
 */
export function provideLogs(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const injector = inject(Injector);
      await inject(ConfigService).whenLoaded;
      injector.get(LogsService).init();
    }),
  ]);
}
