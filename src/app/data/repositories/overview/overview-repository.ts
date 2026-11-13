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
  '#00e5ff', // Cyan elétrico
  '#f97316', // Laranja vibrante
  '#ec4899', // Rosa pink vivo
  '#eab308', // Amarelo ouro brilhante
  '#a855f7', // Roxo elétrico
  '#10b981', // Esmeralda brilhante
  '#3b82f6', // Azul royal vivo
  '#ef4444', // Vermelho vivo
  '#14b8a6', // Turquesa vivo
  '#84cc16', // Lima neon
  '#f43f5e', // Carmesim vibrante
  '#8b5cf6', // Violeta intenso
  '#06b6d4', // Ciano vivo
  '#d97706', // Âmbar saturado
  '#c026d3', // Magenta fúcsia
  '#0284c7', // Azul celeste brilhante
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
      let boundary =
        zoneRegions.length > 0 ? buildOrderedMapBoundary(zoneRegions) : null;

      if (!boundary && zone.polygon && (zone.polygon as Record<string, unknown>)['type'] === 'Polygon') {
        const coords = (zone.polygon as Record<string, unknown>)['coordinates'] as unknown;
        if (Array.isArray(coords) && Array.isArray(coords[0]) && coords[0].length >= 3) {
          const points = (coords[0] as Array<[number, number]>).map((c, i) => ({
            longitude: c[0],
            latitude: c[1],
            order: i + 1,
          }));
          boundary = buildOrderedMapBoundary(points);
        }
      }

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
