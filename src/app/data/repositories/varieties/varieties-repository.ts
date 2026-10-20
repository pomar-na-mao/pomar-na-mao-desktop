import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Variety,
  VarietyDraft,
} from '../../../domain/models/variety.model';
import { VarietiesService } from '../../services/varieties/varieties-service';

export interface VarietyMutationResult {
  data: Variety | null;
  error: PostgrestError | null;
}

@Injectable({ providedIn: 'root' })
export class VarietiesRepository {
  private varietiesService = inject(VarietiesService);

  public varieties = signal<Variety[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.varietiesService.findAll();
    if (!error && data) {
      this.varieties.set(this.sort(data));
    }

    return { error };
  }

  public async create(payload: VarietyDraft): Promise<VarietyMutationResult> {
    const { data, error } = await this.varietiesService.create(payload);
    if (!error && data) {
      this.varieties.update((items) => this.sort([...items, data]));
    }

    return { data: data ?? null, error };
  }

  public async update(
    id: number,
    payload: VarietyDraft,
  ): Promise<VarietyMutationResult> {
    const { data, error } = await this.varietiesService.update(id, payload);
    if (!error && data) {
      this.varieties.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }

    return { data: data ?? null, error };
  }

  public async deleteMany(
    ids: number[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.varietiesService.deleteMany(ids);
    if (!error) {
      const deletedIds = new Set(ids);
      this.varieties.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
    }

    return { error };
  }

  private sort(items: Variety[]): Variety[] {
    return [...items].sort((left, right) =>
      left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
