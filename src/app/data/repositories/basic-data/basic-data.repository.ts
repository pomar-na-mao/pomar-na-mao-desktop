import { inject, Injectable, signal } from "@angular/core";
import {
  EMPTY_BASIC_DATA_FORM_DATA,
  type GeoJsonPolygon,
  type BasicDataCoordinate,
  type BasicDataFormData,
  type BasicDataOccurrenceOption,
  type BasicDataVarietyOption,
  type PlantInsidePolygon,
  type PolygonBulkSelectedPlant,
  type PolygonBulkUpdatePayload,
  type PolygonBulkUpdateResult,
} from "../../../domain/models/basic-data";
import { BasicDataService } from "../../services/basic-data/basic-data.service";

@Injectable({
  providedIn: 'root',
})
export class BasicDataRepository {
  private basicDataService = inject(BasicDataService);

  private _selectedPolygonCoordinates = signal<BasicDataCoordinate[]>([]);
  private _currentBasicDataFormData = signal<BasicDataFormData>(EMPTY_BASIC_DATA_FORM_DATA);
  private _previewPlants = signal<PolygonBulkSelectedPlant[]>([]);
  private _varietyOptions = signal<BasicDataVarietyOption[]>([]);
  private _occurrenceTypeOptions = signal<BasicDataOccurrenceOption[]>([]);

  public selectedPolygonCoordinates = this._selectedPolygonCoordinates.asReadonly();
  public currentBasicDataFormData = this._currentBasicDataFormData.asReadonly();
  public previewPlants = this._previewPlants.asReadonly();
  public varietyOptions = this._varietyOptions.asReadonly();
  public occurrenceTypeOptions = this._occurrenceTypeOptions.asReadonly();

  public savePolygonCoordinates(coordinates: BasicDataCoordinate[]): void {
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

  public saveBasicDataFormData(data: BasicDataFormData): void {
    this._currentBasicDataFormData.set(data);
  }

  public async loadVarietyOptions(): Promise<{ data: BasicDataVarietyOption[] | null; error: unknown }> {
    const result = await this.basicDataService.findVarietyOptions();
    if (!result.error && result.data) {
      this._varietyOptions.set(result.data);
    }
    return result;
  }

  public async loadOccurrenceTypeOptions(): Promise<{ data: BasicDataOccurrenceOption[] | null; error: unknown }> {
    const result = await this.basicDataService.findOccurrenceTypeOptions();
    if (!result.error && result.data) {
      this._occurrenceTypeOptions.set(result.data);
    }
    return result;
  }

  public async previewPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon
  ): Promise<{ data: PolygonBulkSelectedPlant[] | null; error: unknown }> {
    const result = await this.basicDataService.findPlantsInsidePolygon(polygonGeojson);

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
    return this.basicDataService.syncPolygonBulkUpdate(payload);
  }

  private toSelectedPlant(plant: PlantInsidePolygon): PolygonBulkSelectedPlant {
    return {
      ...plant,
      selected: true,
      selectionSource: 'polygon_selected',
    };
  }
}
