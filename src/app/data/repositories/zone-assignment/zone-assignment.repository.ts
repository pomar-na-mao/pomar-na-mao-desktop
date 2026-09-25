import { computed, inject, Injectable, signal } from '@angular/core';
import type { GeoJsonPolygon, MassInclusionCoordinate } from '../../../domain/models/mass-inclusion';
import type {
  AssignZonePayload,
  AssignZoneResult,
  ZoneAssignmentPlant,
  ZoneAssignmentPreviewPlant,
} from '../../../domain/models/zone-assignment.model';
import { ZoneAssignmentService } from '../../services/zone-assignment/zone-assignment.service';

@Injectable({
  providedIn: 'root',
})
export class ZoneAssignmentRepository {
  private zoneAssignmentService = inject(ZoneAssignmentService);

  private _allPlants = signal<ZoneAssignmentPlant[]>([]);
  private _previewPlants = signal<ZoneAssignmentPreviewPlant[]>([]);
  private _selectedPolygonCoordinates = signal<MassInclusionCoordinate[]>([]);

  public allPlants = this._allPlants.asReadonly();
  public previewPlants = this._previewPlants.asReadonly();
  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();

  public selectedPlants = computed(() =>
    this._previewPlants().filter((plant) => plant.selected),
  );
  public plantsFoundCount = computed(() => this._previewPlants().length);
  public selectedPlantsCount = computed(() => this.selectedPlants().length);

  public async loadAllPlants(): Promise<{
    data: ZoneAssignmentPlant[] | null;
    error: unknown;
  }> {
    const result = await this.zoneAssignmentService.getAllPlantsForMap();
    if (!result.error && result.data) {
      this._allPlants.set(result.data);
    }
    return result;
  }

  public savePolygonCoordinates(coordinates: MassInclusionCoordinate[]): void {
    this._selectedPolygonCoordinates.set(
      coordinates.map((c) => ({
        lat: c.lat,
        lng: c.lng,
      })),
    );
    this.clearPreviewPlants();
  }

  public clearPolygonCoordinates(): void {
    this._selectedPolygonCoordinates.set([]);
    this.clearPreviewPlants();
  }

  public async previewPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon,
  ): Promise<{ data: ZoneAssignmentPreviewPlant[] | null; error: unknown }> {
    const result =
      await this.zoneAssignmentService.findPlantsInsidePolygon(polygonGeojson);

    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    this._previewPlants.set(result.data);
    return { data: result.data, error: null };
  }

  public setPlantSelected(plantId: string, selected: boolean): void {
    this._previewPlants.update((plants) =>
      plants.map((plant) =>
        plant.plantId === plantId ? { ...plant, selected } : plant,
      ),
    );
  }

  public toggleAllPlants(selected: boolean): void {
    this._previewPlants.update((plants) =>
      plants.map((plant) => ({ ...plant, selected })),
    );
  }

  public clearPreviewPlants(): void {
    this._previewPlants.set([]);
  }

  public async assignPlantsToZone(
    payload: AssignZonePayload,
  ): Promise<{ data: AssignZoneResult | null; error: unknown }> {
    const result = await this.zoneAssignmentService.assignPlantsToZone(payload);

    if (!result.error && result.data) {
      const assignedIds = new Set(payload.plantIds);
      this._allPlants.update((plants) =>
        plants.map((plant) =>
          assignedIds.has(plant.id)
            ? { ...plant, zoneId: payload.zoneId, zoneName: result.data?.zoneName }
            : plant,
        ),
      );
    }

    return result;
  }
}
