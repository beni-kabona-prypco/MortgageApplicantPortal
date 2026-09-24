import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  name: 'production',
  configUrl: 'config.json',
  appVersion: '#{currentVersion}#',
};
