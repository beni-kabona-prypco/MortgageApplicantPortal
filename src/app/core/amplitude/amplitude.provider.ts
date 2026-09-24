import {
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { ConfigService } from '@core/config';

import { AMPLITUDE_SDK } from './amplitude.sdk';

/**
 * Initializes the Amplitude SDK at app boot. Waits for the runtime config
 * (via `ConfigService.whenLoaded`) before calling `init` — Angular fires all
 * `provideAppInitializer` callbacks in parallel, so relying on order alone
 * would race the `provideAppConfig` HTTP fetch.
 *
 * `Injector` is captured synchronously because `inject()` can only be called
 * inside the sync body of the initializer — after an `await` we're outside
 * the injection context.
 *
 * Register once in the root `ApplicationConfig`, after `provideAppConfig()`.
 */
export function provideAmplitude(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(async () => {
      const injector = inject(Injector);
      await inject(ConfigService).whenLoaded;

      const { amplitude } = injector.get(ConfigService).config;

      if (!amplitude.enabled) {
        return;
      }

      injector.get(AMPLITUDE_SDK).init(amplitude.apiKey);
    }),
  ]);
}
