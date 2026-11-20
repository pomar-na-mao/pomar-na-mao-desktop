import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  HarvestForecastFilters,
  HarvestForecastItem,
} from '../../../domain/models/harvest-forecast.model';
import { HarvestForecastService } from '../../services/harvest-forecast/harvest-forecast.service';

@Injectable({ providedIn: 'root' })
export class HarvestForecastRepository {
  private service = inject(HarvestForecastService);
  private requestId = 0;

  public items = signal<HarvestForecastItem[]>([]);
  public isLoading = signal(false);
  public error = signal<PostgrestError | null>(null);

  public async findAll(
    filters: HarvestForecastFilters = {},
  ): Promise<{ error: PostgrestError | null }> {
    const currentRequestId = ++this.requestId;
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await this.service.findAll(filters);
      if (currentRequestId === this.requestId) {
        this.items.set(response.error ? [] : (response.data ?? []));
        this.error.set(response.error);
      }
      return { error: response.error };
    } finally {
      if (currentRequestId === this.requestId) {
        this.isLoading.set(false);
      }
    }
  }

  public clear(): void {
    this.requestId++;
    this.items.set([]);
    this.error.set(null);
    this.isLoading.set(false);
  }
}
