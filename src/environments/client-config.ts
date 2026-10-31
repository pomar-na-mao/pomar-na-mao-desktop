export type ClientId = keyof typeof CLIENT_CONFIGS;

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
  clientId: ClientId;
};

export const buildAppConfig = (config: EnvironmentConfig) => ({
  production: config.production,
  environment: config.environment,
  clientId: config.clientId,
  ...CLIENT_CONFIGS[config.clientId],
});
