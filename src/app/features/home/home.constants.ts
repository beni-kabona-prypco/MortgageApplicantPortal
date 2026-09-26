import { environment } from '@env/environment';

const BROKER_HUB_URLS: Record<typeof environment.name, string> = {
  development: 'https://red.brokerhub.prypco.com',
  staging: 'https://green.brokerhub.prypco.com',
  production: 'https://brokerhub.prypco.com',
};

export const BROKER_HUB_URL = BROKER_HUB_URLS[environment.name];
