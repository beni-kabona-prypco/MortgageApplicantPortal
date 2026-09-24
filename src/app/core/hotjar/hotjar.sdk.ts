import { InjectionToken } from '@angular/core';

import { HotjarSdk } from './hotjar.model';

type HotjarQueue = ((...args: unknown[]) => void) & { q?: unknown[][] };
type HotjarGlobal = typeof globalThis & {
  hj?: HotjarQueue;
  _hjSettings?: { hjid: number; hjsv: number };
};

/**
 * Mutable indirection over Hotjar's script-injection step. Kept mutable so
 * tests can replace the `inject` fn without touching the DOM.
 */
export const hotjarFns = {
  inject: (siteId: string): void => {
    const w = globalThis as HotjarGlobal;
    w.hj =
      w.hj ??
      function (...args: unknown[]) {
        const hj = w.hj!;
        hj.q = hj.q ?? [];
        hj.q.push(args);
      };
    w._hjSettings = { hjid: Number(siteId), hjsv: 6 };

    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=6`;
    head.appendChild(script);
  },
};

/**
 * DI token holding the Hotjar SDK. The default factory delegates to
 * `hotjarFns.inject` so tests can intercept the call by reassigning that field.
 * Override via `{ provide: HOTJAR_SDK, useValue: spy }` in unit tests.
 */
export const HOTJAR_SDK = new InjectionToken<HotjarSdk>('HOTJAR_SDK', {
  providedIn: 'root',
  factory: () => ({
    init: (siteId: string) => hotjarFns.inject(siteId),
  }),
});
