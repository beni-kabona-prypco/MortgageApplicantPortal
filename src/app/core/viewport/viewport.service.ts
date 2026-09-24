import { inject, Injectable, PLATFORM_ID, Signal, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Desktop layout breakpoint (px) — matches `small-desktop` in _breakpoints.scss. */
export const DESKTOP_MIN_WIDTH_PX = 1010;

/**
 * Single source of truth for the desktop/mobile viewport split. One matchMedia
 * listener for the whole app instead of one per component. SSR-safe: `isDesktop`
 * is `false` on the server (no `matchMedia`).
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mql = isPlatformBrowser(this.platformId)
    ? globalThis.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH_PX}px)`)
    : null;

  private readonly _isDesktop = signal(this.mql?.matches ?? false);
  /** True when the viewport is ≥1010px. Updates live on resize. */
  readonly isDesktop: Signal<boolean> = this._isDesktop.asReadonly();

  constructor() {
    // Root singleton — lives for the app's lifetime, so the listener is never
    // removed (nothing to clean up).
    this.mql?.addEventListener('change', event => this._isDesktop.set(event.matches));
  }
}
