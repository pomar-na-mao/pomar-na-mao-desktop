import { inject, Injectable } from '@angular/core';
import type {
  InspectionOperationResponse,
  MipdMarking,
  OverviewColoredZone,
  OverviewFilterOptions,
  OverviewSnapshot,
  OverviewSnapshotFilters,
} from '../../../domain/models/overview.model';
import type { Region } from '../../../domain/models/regions.model';
import { buildOrderedMapBoundary } from '../../../shared/utils/ordered-map-boundary';
import { OverviewService } from '../../services/overview/overview-service';
import { RegionsRepository } from '../regions/regions-repository';
import { ZonesRepository } from '../zones/zones-repository';

export const ZONE_PALETTE = [
  '#2563eb', // blue
  '#16a34a', // green
  '#d97706', // amber
  '#9333ea', // purple
  '#06b6d4', // cyan
  '#e11d48', // rose
  '#0d9488', // teal
  '#ea580c', // orange
  '#4f46e5', // indigo
  '#ca8a04', // yellow
  '#db2777', // pink
  '#059669', // emerald
  '#7c3aed', // violet
  '#0284c7', // sky
];

@Injectable({
  providedIn: 'root',
})
export class OverviewRepository {
  private overviewService = inject(OverviewService);
  private regionsRepository = inject(RegionsRepository);
  private zonesRepository = inject(ZonesRepository);

  public async getOverviewData(
    filters: OverviewSnapshotFilters,
    onCacheMiss?: () => void,
  ): Promise<OverviewSnapshot> {
    return await this.overviewService.getOverviewData(filters, onCacheMiss);
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

  public async loadAllColoredZones(): Promise<OverviewColoredZone[]> {
    const [, regionsResult] = await Promise.all([
      this.zonesRepository.findAll(),
      this.regionsRepository.findAll(),
    ]);

    if (regionsResult.error) {
      console.error('Failed to load regions for colored zones', regionsResult.error);
    }

    const zones = this.zonesRepository.zones();
    const regions = this.regionsRepository.regions();

    const regionsByZone = new Map<string, Region[]>();
    for (const region of regions) {
      if (!region.zone_id) continue;
      const current = regionsByZone.get(region.zone_id) ?? [];
      current.push(region);
      regionsByZone.set(region.zone_id, current);
    }

    return zones.map((zone, index) => {
      const zoneRegions = regionsByZone.get(zone.id) ?? [];
      const boundary =
        zoneRegions.length > 0 ? buildOrderedMapBoundary(zoneRegions) : null;
      const color = ZONE_PALETTE[index % ZONE_PALETTE.length];

      return {
        id: zone.id,
        name: zone.name,
        color,
        boundary,
      };
    });
  }

  public async getMipdMarkings(
    occurrenceTypeIds?: string[] | null,
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null,
  ): Promise<MipdMarking[]> {
    return await this.overviewService.getMipdMarkings(
      occurrenceTypeIds,
      startDate,
      endDate,
      zoneId,
    );
  }

  public async getInspectionOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null,
  ): Promise<InspectionOperationResponse[]> {
    return await this.overviewService.getInspectionOperations(
      startDate,
      endDate,
      zoneId,
    );
  }

  public async getAnnotationOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null,
  ): Promise<InspectionOperationResponse[]> {
    return await this.overviewService.getAnnotationOperations(
      startDate,
      endDate,
      zoneId,
    );
  }
}
