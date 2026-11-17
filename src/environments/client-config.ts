export type ClientId = keyof typeof CLIENT_CONFIGS;

declare const NG_CLIENT_ID: ClientId | undefined;

export const DEFAULT_CLIENT_ID: ClientId = 'ricardoAbacate';

export type ClientConfig = {
  alias: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  googleMapsApiKey: string;
};

export const CLIENT_CONFIGS = {
  ricardoLichia: {
    alias: 'Ricardo Lichia',
    supabaseUrl: 'https://cumkqrjwsbyotaojeyxv.supabase.co',
    supabasePublishableKey: 'sb_publishable_8Bb-W0YT2zTGI83_bFil7w_ZRucyTwZ',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
  hassAvocado: {
    alias: 'Hass Avocado',
    supabaseUrl: 'https://uxschjkypkkzprbwuhxm.supabase.co',
    supabasePublishableKey: 'sb_publishable_idzivuZYu4ScWTOb14EtQA_VToCjySh',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
  ricardoAbacate: {
    alias: 'Ricardo Abacate',
    supabaseUrl: 'https://hopjwluxjyhfovwylmok.supabase.co',
    supabasePublishableKey: 'sb_publishable_pM5zJfWa1h7p-uirrnh3rQ_dsNqJ6W3',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
} satisfies Record<string, ClientConfig>;

export const ACTIVE_CLIENT_STORAGE_KEY = 'pomar-na-mao.active-client';
export const CONFIGURED_CLIENT_STORAGE_KEY = 'pomar-na-mao.configured-client';
export const TENANT_CATALOG = (Object.keys(CLIENT_CONFIGS) as ClientId[]).map((id) => ({
  id,
  alias: CLIENT_CONFIGS[id].alias,
}));

type TenantStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const isClientId = (value: unknown): value is ClientId =>
  typeof value === 'string' && value in CLIENT_CONFIGS;

const getBrowserStorage = (): TenantStorage | null =>
  typeof window !== 'undefined' ? window.localStorage : null;

export const getTenantAuthStorageKey = (clientId: ClientId): string =>
  `pomar-na-mao.auth.${clientId}`;

export const resolveActiveClientId = (
  fallback: ClientId = DEFAULT_CLIENT_ID,
  storage: TenantStorage | null = getBrowserStorage(),
): ClientId => {
  const storedClientId = storage?.getItem(ACTIVE_CLIENT_STORAGE_KEY);
  return isClientId(storedClientId) ? storedClientId : fallback;
};

export const persistActiveClientId = (
  clientId: ClientId,
  storage: TenantStorage | null = getBrowserStorage(),
): void => storage?.setItem(ACTIVE_CLIENT_STORAGE_KEY, clientId);

export const resolveRuntimeClientId = (
  configuredClientId: ClientId | undefined,
  fallback: ClientId = DEFAULT_CLIENT_ID,
  storage: TenantStorage | null = getBrowserStorage(),
): ClientId => {
  if (isClientId(configuredClientId)) {
    const previousConfiguredClientId = storage?.getItem(CONFIGURED_CLIENT_STORAGE_KEY);
    storage?.setItem(CONFIGURED_CLIENT_STORAGE_KEY, configuredClientId);

    if (previousConfiguredClientId !== configuredClientId) {
      storage?.removeItem(ACTIVE_CLIENT_STORAGE_KEY);
      return configuredClientId;
    }

    return resolveActiveClientId(configuredClientId, storage);
  }

  storage?.removeItem(CONFIGURED_CLIENT_STORAGE_KEY);
  return resolveActiveClientId(fallback, storage);
};

type EnvironmentConfig = {
  production: boolean;
  environment: 'LOCAL' | 'DEV' | 'PROD';
  clientId?: ClientId;
};

export const resolveClientId = (fallback: ClientId = DEFAULT_CLIENT_ID): ClientId => {
  const definedClientId = typeof NG_CLIENT_ID !== 'undefined' ? NG_CLIENT_ID : undefined;
  return definedClientId && definedClientId in CLIENT_CONFIGS ? definedClientId : fallback;
};

export const buildAppConfig = (config: EnvironmentConfig) => {
  const definedClientId = typeof NG_CLIENT_ID !== 'undefined' ? NG_CLIENT_ID : undefined;
  const configuredClientId = isClientId(definedClientId) ? definedClientId : config.clientId;
  const clientId = resolveRuntimeClientId(configuredClientId);

  return {
    production: config.production,
    environment: config.environment,
    clientId,
    ...CLIENT_CONFIGS[clientId],
  };
};
