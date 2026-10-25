import { inject, Injectable } from '@angular/core';
import type {
  OverviewFilterOptions,
  OverviewSnapshot,
  OverviewSnapshotFilters,
} from '../../../domain/models/overview.model';
import type { Region } from '../../../domain/models/regions.model';
import { OverviewService } from '../../services/overview/overview-service';
import { RegionsRepository } from '../regions/regions-repository';

@Injectable({
  providedIn: 'root',
})
export class OverviewRepository {
  private overviewService = inject(OverviewService);
  private regionsRepository = inject(RegionsRepository);

  public async getOverviewData(
    filters: OverviewSnapshotFilters,
    onCacheMiss?: () => void,
  ): Promise<OverviewSnapshot> {
    return await this.overviewService.getOverviewData(
      filters,
      onCacheMiss,
    );
  }

  public async getFilterOptions(): Promise<OverviewFilterOptions> {
    return await this.overviewService.getFilterOptions();
  }

  public async getOpenOccurrences(): Promise<
    Array<{ plant_id: string; occurrence_type_id: string }>
  > {
    return await this.overviewService.getOpenOccurrences();
  }

  public async getZoneRegions(zoneId: string): Promise<Region[]> {
    const { data, error } = await this.regionsRepository.findByZoneId(zoneId);

    if (error) {
      throw error;
    }

    return data;
  }
}
