import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ACTIVE_CLIENT_STORAGE_KEY,
  ClientId,
  getTenantAuthStorageKey,
  persistActiveClientId,
} from '../../../../environments/client-config';
import { APP_CONFIG } from '../../../../environments/environment';
import { UserRolesRepository } from '../../repositories/user-roles/user-roles-repository';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { TenantSupabaseClientFactory } from '../supabase';

export type TenantSwitchFailure =
  | 'authentication-failed'
  | 'authorization-failed'
  | 'unexpected-error';

export type TenantSwitchResult =
  | { ok: true; status: 'switched' | 'unchanged' }
  | { ok: false; reason: TenantSwitchFailure; message: string };

export interface TenantBrowser {
  localStorage: Storage;
  reload(): void;
}

export const TENANT_BROWSER = new InjectionToken<TenantBrowser>('TENANT_BROWSER', {
  providedIn: 'root',
  factory: () => ({
    localStorage: window.localStorage,
    reload: () => window.location.reload(),
  }),
});

@Injectable({ providedIn: 'root' })
export class TenantSwitchService {
  private readonly clientFactory = inject(TenantSupabaseClientFactory);
  private readonly requestCache = inject(SupabaseRequestCacheService);
  private readonly userRolesRepository = inject(UserRolesRepository);
  private readonly browser = inject(TENANT_BROWSER);

  public readonly activeClientId = signal<ClientId>(APP_CONFIG.clientId);
  public readonly busy = signal(false);
  public readonly errorMessage = signal<string | null>(null);

  public async switchTenant(
    targetClientId: ClientId,
    email: string,
    password: string,
  ): Promise<TenantSwitchResult> {
    if (targetClientId === this.activeClientId()) {
      return { ok: true, status: 'unchanged' };
    }

    this.busy.set(true);
    this.errorMessage.set(null);
    const targetClient = this.clientFactory.create(targetClientId);

    try {
      const { data: authData, error: authError } =
        await targetClient.auth.signInWithPassword({ email, password });

      if (authError || !authData.user) {
        await this.discardProvisionalSession(targetClient, targetClientId);
        return this.failure(
          'authentication-failed',
          'Não foi possível autenticar no cliente selecionado.',
        );
      }

      const { data: roleData, error: roleError } = await targetClient
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (roleError || roleData?.role !== 'admin') {
        await this.discardProvisionalSession(targetClient, targetClientId);
        return this.failure(
          'authorization-failed',
          'A conta informada não possui permissão de administrador neste cliente.',
        );
      }

      this.requestCache.clear();
      this.userRolesRepository.clear();
      persistActiveClientId(targetClientId, this.browser.localStorage);
      this.activeClientId.set(targetClientId);
      this.browser.reload();

      return { ok: true, status: 'switched' };
    } catch {
      await this.discardProvisionalSession(targetClient, targetClientId);
      return this.failure(
        'unexpected-error',
        'Ocorreu um erro ao trocar de cliente. Tente novamente.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  public cancel(): void {
    this.errorMessage.set(null);
  }

  private failure(reason: TenantSwitchFailure, message: string): TenantSwitchResult {
    this.errorMessage.set(message);
    return { ok: false, reason, message };
  }

  private async discardProvisionalSession(
    client: SupabaseClient,
    clientId: ClientId,
  ): Promise<void> {
    try {
      await client.auth.signOut({ scope: 'local' });
    } catch {
      // Cleanup is completed by removing the isolated storage entry below.
    }
    this.browser.localStorage.removeItem(getTenantAuthStorageKey(clientId));
  }
}

export const hasCommittedTenant = (storage: Storage): boolean =>
  storage.getItem(ACTIVE_CLIENT_STORAGE_KEY) !== null;
