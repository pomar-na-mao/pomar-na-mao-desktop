import { inject, Injectable } from '@angular/core';
import type {
  ActivityEntryDraft,
  ActivitySyncPayload,
  ActivitySyncResult,
} from '../../../domain/models/activity-entry.model';
import { buildActivityGeometry } from '../../../domain/models/activity-entry.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

const DEVICE_ID_KEY = 'pomar-na-mao.desktop.activity-device-id';

@Injectable({ providedIn: 'root' })
export class ActivityEntryService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async create(draft: ActivityEntryDraft): Promise<ActivitySyncResult> {
    const payload: ActivitySyncPayload = {
      deviceId: this.getDeviceId(),
      entries: [
        {
          localId: createId(),
          geometryType: draft.geometryType,
          geometry: buildActivityGeometry(draft.geometryType, draft.coordinates),
          activity: draft.activity.trim(),
          performedAt: draft.performedAt,
          responsible: draft.responsible.trim(),
          ...(draft.mixtureId ? { mixtureId: draft.mixtureId } : {}),
          ...(draft.machineId ? { machineId: draft.machineId } : {}),
          inputs: [],
        },
      ],
    };

    const { data, error } = await this.supabase.rpc('sync_activity_entries', {
      p_payload: payload,
    });
    if (error) throw error;
    if (!Array.isArray(data) || data.length !== 1) {
      throw new Error('A RPC retornou uma resposta inválida para a atividade.');
    }

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.operations,
      SUPABASE_CACHE_NAMESPACES.overview,
    ]);
    return data[0] as ActivitySyncResult;
  }

  private getDeviceId(): string {
    if (typeof window === 'undefined') return 'desktop-server';
    const stored = window.localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const created = `desktop-${createId()}`;
    window.localStorage.setItem(DEVICE_ID_KEY, created);
    return created;
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
