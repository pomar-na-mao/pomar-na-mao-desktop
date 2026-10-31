import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  MachineDraft,
  MachineItem,
} from '../../../domain/models/machine.model';
import { MachinesService } from '../../services/machines/machines.service';

export interface MachineMutationResult {
  data: MachineItem | null;
  error: PostgrestError | null;
}

@Injectable({ providedIn: 'root' })
export class MachinesRepository {
  private machinesService = inject(MachinesService);

  public machines = signal<MachineItem[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.machinesService.findAll();
    if (!error && data) {
      this.machines.set(this.sort(data));
    }

    return { error };
  }

  public async create(payload: MachineDraft): Promise<MachineMutationResult> {
    const { data, error } = await this.machinesService.create(payload);
    if (!error && data) {
      this.machines.update((items) => this.sort([...items, data]));
    }

    return { data: data ?? null, error };
  }

  public async update(
    id: string,
    payload: MachineDraft,
  ): Promise<MachineMutationResult> {
    const { data, error } = await this.machinesService.update(id, payload);
    if (!error && data) {
      this.machines.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }

    return { data: data ?? null, error };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.machinesService.deleteMany(ids);
    if (!error) {
      const deletedIds = new Set(ids);
      this.machines.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
    }

    return { error };
  }

  private sort(items: MachineItem[]): MachineItem[] {
    return [...items].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    );
  }
}
