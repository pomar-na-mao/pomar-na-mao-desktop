import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import {
  DEFAULT_INPUT_TYPES,
  type InputDraft,
  type InputItem,
} from '../../../domain/models/input.model';
import { InputsService } from '../../services/inputs/inputs.service';

export interface InputMutationResult {
  data: InputItem | null;
  error: PostgrestError | null;
}

@Injectable({ providedIn: 'root' })
export class InputsRepository {
  private inputsService = inject(InputsService);

  public inputs = signal<InputItem[]>([]);
  public availableTypes = signal<string[]>([...DEFAULT_INPUT_TYPES]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.inputsService.findAll();
    if (!error && data) {
      this.inputs.set(this.sort(data));
    }
    return { error };
  }

  public async loadEnumValues(): Promise<void> {
    const values = await this.inputsService.fetchEnumValues();
    if (values && values.length > 0) {
      // Mescla com os tipos padrão caso algum falte
      const merged = Array.from(new Set([...DEFAULT_INPUT_TYPES, ...values]));
      this.availableTypes.set(merged);
    }
  }

  public async create(payload: InputDraft): Promise<InputMutationResult> {
    const { data, error } = await this.inputsService.create(payload);
    if (!error && data) {
      this.inputs.update((items) => this.sort([...items, data]));
    }
    return { data: data ?? null, error };
  }

  public async update(
    id: string,
    payload: InputDraft,
  ): Promise<InputMutationResult> {
    const { data, error } = await this.inputsService.update(id, payload);
    if (!error && data) {
      this.inputs.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }
    return { data: data ?? null, error };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.inputsService.deleteMany(ids);
    if (!error) {
      const deletedIds = new Set(ids);
      this.inputs.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
    }
    return { error };
  }

  public async addEnumValue(
    newValue: string,
  ): Promise<{ error: Error | null }> {
    const upper = newValue.trim().toUpperCase();
    const result = await this.inputsService.addEnumValue(upper);
    if (!result.error) {
      this.availableTypes.update((types) =>
        types.includes(upper) ? types : [...types, upper],
      );
    }
    return result;
  }

  private sort(items: InputItem[]): InputItem[] {
    return [...items].sort(
      (left, right) =>
        right.updated_at.localeCompare(left.updated_at) ||
        left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
