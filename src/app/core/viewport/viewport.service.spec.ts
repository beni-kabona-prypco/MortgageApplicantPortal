import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  let changeHandler: ((event: MediaQueryListEvent) => void) | null;

  function mockMatchMedia(matches: boolean): void {
    changeHandler = null;
    spyOn(globalThis, 'matchMedia').and.returnValue({
      matches,
      addEventListener: (_: string, handler: (e: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
    } as unknown as MediaQueryList);
  }

  function create(platform: 'browser' | 'server'): ViewportService {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platform }, ViewportService],
    });
    return TestBed.inject(ViewportService);
  }

  it('is false on the server (no matchMedia)', () => {
    const service = create('server');
    expect(service.isDesktop()).toBe(false);
  });

  it('reflects the initial media-query match in the browser', () => {
    mockMatchMedia(true);
    expect(create('browser').isDesktop()).toBe(true);
  });

  it('updates the signal when the media query changes', () => {
    mockMatchMedia(false);
    const service = create('browser');
    expect(service.isDesktop()).toBe(false);

    changeHandler?.({ matches: true } as MediaQueryListEvent);
    expect(service.isDesktop()).toBe(true);
  });
});
