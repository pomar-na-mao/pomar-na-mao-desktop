export type ClientId = keyof typeof CLIENT_CONFIGS;

declare const NG_CLIENT_ID: ClientId | undefined;

export const DEFAULT_CLIENT_ID: ClientId = 'ricardoAbacate';

type ClientConfig = {
  supabaseUrl: string;
  supabasePublishableKey: string;
  googleMapsApiKey: string;
};

export const CLIENT_CONFIGS = {
  ricardoLichia: {
    supabaseUrl: 'https://cumkqrjwsbyotaojeyxv.supabase.co',
    supabasePublishableKey: 'sb_publishable_8Bb-W0YT2zTGI83_bFil7w_ZRucyTwZ',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
  hassAvocado: {
    supabaseUrl: 'https://uxschjkypkkzprbwuhxm.supabase.co',
    supabasePublishableKey: 'sb_publishable_idzivuZYu4ScWTOb14EtQA_VToCjySh',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
  ricardoAbacate: {
    supabaseUrl: 'https://hopjwluxjyhfovwylmok.supabase.co',
    supabasePublishableKey: 'sb_publishable_pM5zJfWa1h7p-uirrnh3rQ_dsNqJ6W3',
    googleMapsApiKey: 'AIzaSyAwXpNXIj4cVFbk7Bcpaqxd4tNG_nIbz5w',
  },
} satisfies Record<string, ClientConfig>;

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
  const clientId = resolveClientId(config.clientId);

  return {
    production: config.production,
    environment: config.environment,
    clientId,
    ...CLIENT_CONFIGS[clientId],
  };
};
