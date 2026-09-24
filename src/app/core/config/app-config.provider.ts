import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { AppConfig } from './app-config.model';
import { ConfigService } from './config.service';

export async function loadAppConfig(
  http: HttpClient,
  configService: ConfigService,
  url: string = environment.configUrl
): Promise<void> {
  try {
    const config = await firstValueFrom(http.get<AppConfig>(url));
    configService.set(config);
  } catch (error) {
    throw new Error(`[provideAppConfig] Failed to load runtime config from "${url}".`, {
      cause: error,
    });
  }
}

export function provideAppConfig(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => loadAppConfig(inject(HttpClient), inject(ConfigService))),
  ]);
}
