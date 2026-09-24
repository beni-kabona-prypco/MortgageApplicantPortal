import { Injectable, signal } from '@angular/core';
import { AppConfig } from './app-config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly _config = signal<AppConfig | null>(null);
  private resolveLoaded!: () => void;
  private readonly _whenLoaded = new Promise<void>(resolve => {
    this.resolveLoaded = resolve;
  });

  get config(): AppConfig {
    const value = this._config();

    if (!value) {
      throw new Error('[ConfigService] Runtime config accessed before it was loaded.');
    }

    return value;
  }

  get whenLoaded(): Promise<void> {
    return this._whenLoaded;
  }

  set(config: AppConfig): void {
    this._config.set(config);
    this.resolveLoaded();
  }
}
