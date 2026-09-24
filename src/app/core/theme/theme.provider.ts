import { DOCUMENT } from '@angular/common';
import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { THEME_ATTRIBUTE } from '@prypco/web-tokens';
import type { ThemeName } from '@prypco/web-tokens';

import { APP_THEME } from './theme.constants';

export function applyTheme(document: Document, theme: ThemeName = APP_THEME): void {
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

export function provideTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([provideAppInitializer(() => applyTheme(inject(DOCUMENT)))]);
}
