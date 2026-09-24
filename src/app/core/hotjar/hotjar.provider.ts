import {
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { ConfigService } from '@core/config';

import { HotjarService } from './hotjar.service';

/**
 * Initializes the Hotjar SDK at app boot. Waits for the runtime config to be
 * loaded before calling `init` — Angular fires all `provideAppInitializer`
 * callbacks in parallel, so relying on order alone would race the
 * `provideAppConfig` HTTP fetch.
 *
 * Register once in the root ApplicationConfig, after `provideAppConfig()`.
 */
export function provideHotjar(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const injector = inject(Injector);
      await inject(ConfigService).whenLoaded;
      injector.get(HotjarService).init();
    }),
  ]);
}
