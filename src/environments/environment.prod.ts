import { buildAppConfig } from './client-config';

export const APP_CONFIG = buildAppConfig({
  production: true,
  environment: 'PROD',
  clientId: 'hassAvocado',
});
