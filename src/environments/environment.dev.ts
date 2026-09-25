import { buildAppConfig } from "./client-config";

export const APP_CONFIG = buildAppConfig({
  production: false,
  environment: 'DEV',
  clientId: 'hassAvocado',
});
