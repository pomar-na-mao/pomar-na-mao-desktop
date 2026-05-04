import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Variety,
  VarietyInsert,
  VarietyUpdate,
} from '../../../domain/models/variety.model';
import { VarietiesService } from '../../services/varieties/varieties-service';

@Injectable({
  providedIn: 'root',
})
export class VarietiesRepository {
  private varietiesService = inject(VarietiesService);

  public varieties = signal<Variety[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.varietiesService.findAll();

    if (!error && data) {
      this.varieties.set(this.sortVarieties(data));
    }

    return { error };
  }

  public async insert(
    variety: VarietyInsert,
  ): Promise<{ data: Variety | null; error: PostgrestError | null }> {
    const { data, error } = await this.varietiesService.insert(variety);
    if (!error && data) {
      this.varieties.update((current) => this.sortVarieties([...current, data]));
    }

    return { data, error };
  }

  public async update(
    id: number,
    variety: VarietyUpdate,
  ): Promise<{ data: Variety | null; error: PostgrestError | null }> {
    const { data, error } = await this.varietiesService.update(id, variety);
    if (!error && data) {
      this.varieties.update((current) =>
        this.sortVarieties(
          current.map((item) => (item.id === id ? data : item)),
        ),
      );
    }

    return { data, error };
  }

  public async delete(id: number): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.varietiesService.delete(id);
    if (!error) {
      this.varieties.update((current) =>
        current.filter((item) => item.id !== id),
      );
    }

    return { error };
  }

  private sortVarieties(varieties: Variety[]): Variety[] {
    return [...varieties].sort((left, right) =>
      left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
