import { inject, Injectable } from '@angular/core';
import type {
  HomeDashboardFilterOptions,
  HomeDashboardSnapshot,
  HomeDashboardSnapshotFilters,
} from '../../../domain/models/home-dashboard.model';
import { HomeDashboardService } from '../../services/home-dashboard/home-dashboard-service';

@Injectable({
  providedIn: 'root',
})
export class HomeDashboardRepository {
  private homeDashboardService = inject(HomeDashboardService);

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
}
