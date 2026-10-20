import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  OccurrenceType,
  OccurrenceTypeDraft,
} from '../../../domain/models/occurrence-type.model';
import { OccurrenceTypesService } from '../../services/occurrence-types/occurrence-types.service';

export interface OccurrenceTypeMutationResult {
  data: OccurrenceType | null;
  error: PostgrestError | null;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceTypesRepository {
  private occurrenceTypesService = inject(OccurrenceTypesService);

  public occurrenceTypes = signal<OccurrenceType[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.occurrenceTypesService.findAll();
    if (!error && data) {
      this.occurrenceTypes.set(this.sort(data));
    }

    return { error };
  }

  public async create(
    payload: OccurrenceTypeDraft,
  ): Promise<OccurrenceTypeMutationResult> {
    const { data, error } = await this.occurrenceTypesService.create(payload);
    if (!error && data) {
      this.occurrenceTypes.update((items) => this.sort([...items, data]));
    }

    return { data: data ?? null, error };
  }

  public async update(
    id: string,
    payload: OccurrenceTypeDraft,
  ): Promise<OccurrenceTypeMutationResult> {
    const { data, error } = await this.occurrenceTypesService.update(
      id,
      payload,
    );
    if (!error && data) {
      this.occurrenceTypes.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }

    return { data: data ?? null, error };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.occurrenceTypesService.deleteMany(ids);
    if (!error) {
      const deletedIds = new Set(ids);
      this.occurrenceTypes.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
    }

    return { error };
  }

  private sort(items: OccurrenceType[]): OccurrenceType[] {
    return [...items].sort(
      (left, right) =>
        right.updated_at.localeCompare(left.updated_at) ||
        left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
