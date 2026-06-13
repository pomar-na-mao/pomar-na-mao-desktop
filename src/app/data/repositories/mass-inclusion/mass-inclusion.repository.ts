import { inject, Injectable, signal } from "@angular/core";
import {
  EMPTY_MASS_INCLUSION_DATA,
  type GeoJsonPolygon,
  type MassInclusionCoordinate,
  type MassInclusionData,
  type MassInclusionOccurrenceOption,
  type MassInclusionVarietyOption,
  type PlantInsidePolygon,
  type PolygonBulkSelectedPlant,
  type PolygonBulkUpdatePayload,
  type PolygonBulkUpdateResult,
} from "../../../domain/models/mass-inclusion";
import { MassInclusionService } from "../../services/mass-inclusion/mass-inclusion.service";

@Injectable({
  providedIn: 'root',
})
export class MassInclusionRepository {
  private massInclusionService = inject(MassInclusionService);

  private _selectedPolygonCoordinates = signal<MassInclusionCoordinate[]>([]);
  private _currentMassInclusionData = signal<MassInclusionData>(EMPTY_MASS_INCLUSION_DATA);
  private _previewPlants = signal<PolygonBulkSelectedPlant[]>([]);
  private _varietyOptions = signal<MassInclusionVarietyOption[]>([]);
  private _occurrenceTypeOptions = signal<MassInclusionOccurrenceOption[]>([]);

  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();
  public currentMassInclusionData = this._currentMassInclusionData.asReadonly();
  public previewPlants = this._previewPlants.asReadonly();
  public varietyOptions = this._varietyOptions.asReadonly();
  public occurrenceTypeOptions = this._occurrenceTypeOptions.asReadonly();

  public savePolygonCoordinates(coordinates: MassInclusionCoordinate[]): void {
    this._selectedPolygonCoordinates.set(
      coordinates.map((coordinate) => ({
        lat: coordinate.lat,
        lng: coordinate.lng,
      }))
    );
    this.clearPreviewPlants();
  }

  public clearPolygonCoordinates(): void {
    this._selectedPolygonCoordinates.set([]);
    this.clearPreviewPlants();
  }

  public saveMassInclusionData(data: MassInclusionData): void {
    this._currentMassInclusionData.set(data);
  }

  public async loadVarietyOptions(): Promise<{ data: MassInclusionVarietyOption[] | null; error: unknown }> {
    const result = await this.massInclusionService.findVarietyOptions();
    if (!result.error && result.data) {
      this._varietyOptions.set(result.data);
    }
    return result;
  }

  public async loadOccurrenceTypeOptions(): Promise<{ data: MassInclusionOccurrenceOption[] | null; error: unknown }> {
    const result = await this.massInclusionService.findOccurrenceTypeOptions();
    if (!result.error && result.data) {
      this._occurrenceTypeOptions.set(result.data);
    }
    return result;
  }

  public async previewPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon
  ): Promise<{ data: PolygonBulkSelectedPlant[] | null; error: unknown }> {
    const result = await this.massInclusionService.findPlantsInsidePolygon(polygonGeojson);

    if (result.error || !result.data) {
      return { data: null, error: result.error };
    }

    const selectedPlants = result.data.map((plant) => this.toSelectedPlant(plant));
    this._previewPlants.set(selectedPlants);

    return { data: selectedPlants, error: null };
  }

  public setPlantSelected(plantId: string, selected: boolean): void {
    this._previewPlants.update((plants) =>
      plants.map((plant) =>
        plant.plantId === plantId
          ? {
              ...plant,
              selected,
              selectionSource: selected ? 'user_restored' : 'user_removed',
            }
          : plant
      )
    );
  }

  public clearPreviewPlants(): void {
    this._previewPlants.set([]);
  }

  public async syncPolygonBulkUpdate(
    payload: PolygonBulkUpdatePayload
  ): Promise<{ data: PolygonBulkUpdateResult | null; error: unknown }> {
    return this.massInclusionService.syncPolygonBulkUpdate(payload);
  }

  private toSelectedPlant(plant: PlantInsidePolygon): PolygonBulkSelectedPlant {
    return {
      ...plant,
      selected: true,
      selectionSource: 'polygon_selected',
    };
  }
}
