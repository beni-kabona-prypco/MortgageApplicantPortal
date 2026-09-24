import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideAmplitude } from '@core/amplitude';
import { provideAppConfig } from '@core/config';
import { provideHotjar } from '@core/hotjar';
import { baseUrlInterceptor, errorInterceptor } from '@core/http';
import { provideLogs } from '@core/logs';
import { provideRum } from '@core/rum';
import { providePageTitle } from '@core/page-title';
import { provideTheme } from '@core/theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([baseUrlInterceptor, errorInterceptor])),
    provideAppConfig(),
    provideTheme(),
    providePageTitle(),
    provideAmplitude(),
    provideRum(),
    provideLogs(),
    provideHotjar(),
  ],
};
