import { InjectionToken } from '@angular/core';
import * as amplitude from '@amplitude/analytics-browser';

import { AmplitudeSdk } from './amplitude.model';

/**
 * Mutable indirection over the frozen `@amplitude/analytics-browser` ES module.
 * Only referenced by the default token factory — tests replace these fields to
 * intercept SDK calls without hitting the real Amplitude module.
 */
export const amplitudeModuleFns = {
  init: amplitude.init,
  track: amplitude.track,
  reset: amplitude.reset,
};

/**
 * DI token holding the concrete Amplitude SDK. The default factory disables
 * autocapture so the app only fires explicit events. Override this token in
 * tests to avoid touching the real SDK.
 */
export const AMPLITUDE_SDK = new InjectionToken<AmplitudeSdk>('AMPLITUDE_SDK', {
  providedIn: 'root',
  factory: () => ({
    init: (apiKey: string) =>
      amplitudeModuleFns.init(apiKey, undefined, { autocapture: false }),
    track: (eventName: string, properties?: Readonly<Record<string, unknown>>) =>
      amplitudeModuleFns.track(eventName, properties),
    reset: () => amplitudeModuleFns.reset(),
  }),
});
