import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: true,
  name: 'staging',
  configUrl: 'config.json',
  appVersion: '#{currentVersion}#',
};
