import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../../../environments/environment';
import {
  CLIENT_CONFIGS,
  ClientId,
  getTenantAuthStorageKey,
} from '../../../environments/client-config';

export const createTenantSupabaseClient = (clientId: ClientId): SupabaseClient => {
  const config = CLIENT_CONFIGS[clientId];
  return new SupabaseClient(config.supabaseUrl, config.supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: getTenantAuthStorageKey(clientId),
    },
  });
};

@Injectable({ providedIn: 'root' })
export class TenantSupabaseClientFactory {
  public create(clientId: ClientId): SupabaseClient {
    return createTenantSupabaseClient(clientId);
  }
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private static instance: SupabaseService;

  public supabase!: SupabaseClient;

  constructor() {
    if (SupabaseService.instance) {
      return SupabaseService.instance;
    }

    if (typeof window !== 'undefined' && !this.supabase) {
      this.supabase = createTenantSupabaseClient(APP_CONFIG.clientId);
    }

    SupabaseService.instance = this;
  }

  public getClient(): SupabaseClient {
    return this.supabase;
  }

  public async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}

export const injectSupabase = (): SupabaseClient => {
  const supabaseService = inject(SupabaseService);
  return supabaseService.getClient();
};


