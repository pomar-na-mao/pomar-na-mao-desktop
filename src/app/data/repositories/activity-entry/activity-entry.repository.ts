import { inject, Injectable } from '@angular/core';
import type {
  ActivityEntryDraft,
  ActivityFormCatalogs,
  ActivityMapZone,
  ActivitySyncResult,
} from '../../../domain/models/activity-entry.model';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import { FarmBoundaryService } from '../../services/farm-boundary/farm-boundary-service';
import { MachinesService } from '../../services/machines/machines.service';
import { MixturesService } from '../../services/mixtures/mixtures.service';
import { PlantsService } from '../../services/plants/plants-service';
import { ActivityEntryService } from '../../services/activity-entry/activity-entry.service';
import { RegionsService } from '../../services/regions/regions-service';
import { ZonesService } from '../../services/zones/zones-service';

@Injectable({ providedIn: 'root' })
export class ActivityEntryRepository {
  private activityEntryService = inject(ActivityEntryService);
  private machinesService = inject(MachinesService);
  private mixturesService = inject(MixturesService);
  private farmBoundaryService = inject(FarmBoundaryService);
  private regionsService = inject(RegionsService);
  private zonesService = inject(ZonesService);
  private plantsService = inject(PlantsService);

  public async loadCatalogs(): Promise<ActivityFormCatalogs> {
    const [machines, mixtures, boundary, zones, regions, plants] =
      await Promise.all([
        this.machinesService.findAll(),
        this.mixturesService.findAll(),
        this.farmBoundaryService.getBoundary(),
        this.zonesService.findAll(),
        this.regionsService.findAll(),
        this.plantsService.getAllPlantsForMap(),
      ]);
    if (machines.error) throw machines.error;
    if (mixtures.error) throw mixtures.error;
    if (zones.error) throw zones.error;
    if (regions.error) throw regions.error;
    if (plants.error) throw plants.error;

    return {
      machines: [...(machines.data ?? [])].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      mixtures: (mixtures.data ?? [])
        .filter((mixture) => mixture.is_active)
        .sort((a, b) => a.name.localeCompare(b.name)),
      boundary: boundary
        .filter(
          (
            point,
          ): point is typeof point & { latitude: number; longitude: number } =>
            point.latitude !== null && point.longitude !== null,
        )
        .map(({ latitude, longitude }) => ({ latitude, longitude })),
      zones: this.buildMapZones(zones.data ?? [], regions.data ?? []),
      plants: (plants.data ?? []).filter(
        (plant) =>
          Number.isFinite(plant.latitude) && Number.isFinite(plant.longitude),
      ),
    };
  }

  public create(draft: ActivityEntryDraft): Promise<ActivitySyncResult> {
    return this.activityEntryService.create(draft);
  }

  private buildMapZones(zones: Zone[], regions: Region[]): ActivityMapZone[] {
    const regionCoordinates = new Map<
      string,
      Array<{ latitude: number; longitude: number; order: number }>
    >();

    regions.forEach((region) => {
      const order = Number(region.order);
      if (
        !region.zone_id ||
        !Number.isFinite(region.latitude) ||
        !Number.isFinite(region.longitude) ||
        !Number.isFinite(order)
      ) {
        return;
      }

      const points = regionCoordinates.get(region.zone_id) ?? [];
      points.push({
        latitude: region.latitude,
        longitude: region.longitude,
        order,
      });
      regionCoordinates.set(region.zone_id, points);
    });

    return [...zones]
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
      .map((zone): ActivityMapZone | null => {
        const orderedRegion = (regionCoordinates.get(zone.id) ?? [])
          .sort((left, right) => left.order - right.order)
          .map(({ latitude, longitude }) => ({ latitude, longitude }));
        const coordinates =
          orderedRegion.length >= 3
            ? orderedRegion
            : this.parseZonePolygon(zone.polygon);

        return coordinates
          ? { id: zone.id, name: zone.name, coordinates }
          : null;
      })
      .filter((zone): zone is ActivityMapZone => zone !== null);
  }

  private parseZonePolygon(
    polygon: Record<string, unknown> | null | undefined,
  ): ActivityMapZone['coordinates'] | null {
    if (!polygon || polygon['type'] !== 'Polygon') return null;
    const rings = polygon['coordinates'];
    if (!Array.isArray(rings) || !Array.isArray(rings[0])) return null;

    const coordinates = rings[0]
      .map((point): { latitude: number; longitude: number } | null => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const [longitude, latitude] = point;
        return Number.isFinite(latitude) && Number.isFinite(longitude)
          ? { latitude: Number(latitude), longitude: Number(longitude) }
          : null;
      })
      .filter(
        (point): point is { latitude: number; longitude: number } =>
          point !== null,
      );

    if (coordinates.length < 3) return null;
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    return first.latitude === last.latitude &&
      first.longitude === last.longitude
      ? coordinates.slice(0, -1)
      : coordinates;
  }
}
