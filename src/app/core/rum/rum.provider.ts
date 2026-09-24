import {
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { ConfigService } from '@core/config';

import { RumService } from './rum.service';

/**
 * Initializes the Datadog RUM SDK at app boot. Waits for the runtime config
 * to be loaded (via `ConfigService.whenLoaded`) before calling `init` — Angular
 * fires all `provideAppInitializer` callbacks in parallel, so relying on order
 * alone would race the `provideAppConfig` HTTP fetch.
 *
 * Register once in the root ApplicationConfig, after `provideAppConfig()`.
 */
export function provideRum(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const injector = inject(Injector);
      await inject(ConfigService).whenLoaded;
      injector.get(RumService).init();
    }),
  ]);
}
