import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';
import { FieldActivitiesService } from '../../services/field-activities/field-activities.service';
import { injectSupabase } from '../../services/supabase';

@Injectable({ providedIn: 'root' })
export class FieldActivitiesRepository {
  private fieldActivitiesService = inject(FieldActivitiesService);
  private supabase = injectSupabase();
  private requestId = 0;

  public activities = signal<FieldActivityItem[]>([]);

  public async findAll(
    startDate?: string | null,
    endDate?: string | null,
  ): Promise<{ error: PostgrestError | null }> {
    const currentRequestId = ++this.requestId;
    const { data, error } = await this.fieldActivitiesService.getFieldActivities(
      startDate,
      endDate,
    );

    if (currentRequestId === this.requestId) {
      if (!error && data) {
        const enriched = await this.enrichMissingMachineData(data as FieldActivityItem[]);
        this.activities.set(enriched);
      } else {
        this.activities.set([]);
      }
    }

    return { error };
  }

  private async enrichMissingMachineData(
    items: FieldActivityItem[],
  ): Promise<FieldActivityItem[]> {
    if (items.length === 0) return items;

    // Se a RPC já retornar as colunas (mesmo que com valor null), não há necessidade de enriquecer
    const first = items[0] as unknown as Record<string, unknown>;
    const hasMachineColumns = 'machine_name' in first && 'machine_id' in first;
    if (hasMachineColumns) {
      return items;
    }

    try {
      const ids = items.map((i) => i.id);
      const { data: entries, error } = await this.supabase
        .from('activity_entries')
        .select('id, machine_id, machine_name_snapshot')
        .in('id', ids);

      if (error || !entries) return items;

      const entryMap = new Map<
        string,
        { machine_id: string | null; machine_name_snapshot: string | null }
      >(entries.map((e) => [e.id, e]));

      const machineIdsToFetch = Array.from(
        new Set(
          entries
            .filter((e) => e.machine_id && !e.machine_name_snapshot)
            .map((e) => e.machine_id as string),
        ),
      );

      const machineNameMap = new Map<string, string>();
      if (machineIdsToFetch.length > 0) {
        const { data: machines } = await this.supabase
          .from('machines')
          .select('id, name')
          .in('id', machineIdsToFetch);

        if (machines) {
          machines.forEach((m) => machineNameMap.set(m.id, m.name));
        }
      }

      return items.map((item) => {
        const meta = entryMap.get(item.id);
        if (!meta) {
          return {
            ...item,
            machine_id: item.machine_id ?? null,
            machine_name: item.machine_name ?? null,
          };
        }

        const machineName =
          meta.machine_name_snapshot ||
          (meta.machine_id ? machineNameMap.get(meta.machine_id) || null : null);

        return {
          ...item,
          machine_id: meta.machine_id ?? null,
          machine_name: machineName,
        };
      });
    } catch {
      return items;
    }
  }
}
