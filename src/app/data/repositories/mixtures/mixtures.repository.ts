import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  MixtureDraft,
  MixtureItem,
} from '../../../domain/models/mixture.model';
import { MixturesService } from '../../services/mixtures/mixtures.service';

export interface MixtureMutationResult {
  data: MixtureItem | null;
  error: PostgrestError | null;
}

@Injectable({ providedIn: 'root' })
export class MixturesRepository {
  private mixturesService = inject(MixturesService);

  public mixtures = signal<MixtureItem[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.mixturesService.findAll();
    if (!error && data) {
      this.mixtures.set(this.sort(data));
    }
    return { error };
  }

  public async create(payload: MixtureDraft): Promise<MixtureMutationResult> {
    const { data, error } = await this.mixturesService.create(payload);
    if (!error && data) {
      this.mixtures.update((items) => this.sort([...items, data]));
    }
    return { data, error };
  }

  public async update(
    id: string,
    payload: MixtureDraft,
  ): Promise<MixtureMutationResult> {
    const { data, error } = await this.mixturesService.update(id, payload);
    if (!error && data) {
      this.mixtures.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }
    return { data, error };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.mixturesService.deleteMany(ids);
    if (!error) {
      const deletedIds = new Set(ids);
      this.mixtures.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
    }
    return { error };
  }

  private sort(items: MixtureItem[]): MixtureItem[] {
    return [...items].sort(
      (left, right) =>
        right.updated_at.localeCompare(left.updated_at) ||
        left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
