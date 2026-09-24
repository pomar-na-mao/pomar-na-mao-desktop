import { inject, Injectable } from '@angular/core';
import type {
  HomeDashboardFilterOptions,
  HomeDashboardSnapshot,
  HomeDashboardSnapshotFilters,
} from '../../../domain/models/home-dashboard.model';
import type { Region } from '../../../domain/models/regions.model';
import { HomeDashboardService } from '../../services/home-dashboard/home-dashboard-service';
import { RegionsRepository } from '../regions/regions-repository';

@Injectable({
  providedIn: 'root',
})
export class HomeDashboardRepository {
  private homeDashboardService = inject(HomeDashboardService);
  private regionsRepository = inject(RegionsRepository);

  public async getHomeDashboardData(
    filters: HomeDashboardSnapshotFilters,
    onCacheMiss?: () => void,
  ): Promise<HomeDashboardSnapshot> {
    return await this.homeDashboardService.getHomeDashboardData(
      filters,
      onCacheMiss,
    );
  }

  public async getFilterOptions(): Promise<HomeDashboardFilterOptions> {
    return await this.homeDashboardService.getFilterOptions();
  }

  public async getOpenOccurrences(): Promise<
    Array<{ plant_id: string; occurrence_type_id: string }>
  > {
    return await this.homeDashboardService.getOpenOccurrences();
  }

  public async getZoneRegions(zoneId: string): Promise<Region[]> {
    const { data, error } = await this.regionsRepository.findByZoneId(zoneId);

    if (error) {
      throw error;
    }

    return data;
  }
}
