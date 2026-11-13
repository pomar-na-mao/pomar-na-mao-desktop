import { inject, Injectable, signal } from '@angular/core';
import type {
  PolygonOccurrenceCoordinate,
  PolygonOccurrenceGeoJson,
  PolygonOccurrenceOption,
  PolygonOccurrencePayload,
  PolygonOccurrencePreviewPlant,
  PolygonOccurrenceResult,
} from '../../../domain/models/polygon-occurrences';
import { PolygonOccurrencesService } from '../../services/polygon-occurrences/polygon-occurrences.service';

@Injectable({ providedIn: 'root' })
export class PolygonOccurrencesRepository {
  private service = inject(PolygonOccurrencesService);

  private coordinates = signal<PolygonOccurrenceCoordinate[]>([]);
  private preview = signal<PolygonOccurrencePreviewPlant[]>([]);
  private occurrenceTypes = signal<PolygonOccurrenceOption[]>([]);

  public selectedPolygonCoordinates = this.coordinates.asReadonly();
  public previewPlants = this.preview.asReadonly();
  public occurrenceTypeOptions = this.occurrenceTypes.asReadonly();

  public savePolygonCoordinates(coordinates: PolygonOccurrenceCoordinate[]): void {
    this.coordinates.set(coordinates.map((coordinate) => ({ ...coordinate })));
    this.clearPreview();
  }

  public clearPolygon(): void {
    this.coordinates.set([]);
    this.clearPreview();
  }

  public clearPreview(): void {
    this.preview.set([]);
  }

  public async loadOccurrenceTypeOptions(): Promise<{
    data: PolygonOccurrenceOption[] | null;
    error: unknown;
  }> {
    const result = await this.service.findOccurrenceTypeOptions();
    if (!result.error && result.data) this.occurrenceTypes.set(result.data);
    return result;
  }

  public async previewPlantsInsidePolygon(
    polygonGeojson: PolygonOccurrenceGeoJson,
  ): Promise<{ data: PolygonOccurrencePreviewPlant[] | null; error: unknown }> {
    const result = await this.service.findPlantsInsidePolygon(polygonGeojson);
    if (!result.error && result.data) this.preview.set(result.data);
    return result;
  }

  public syncPolygonOccurrences(
    payload: PolygonOccurrencePayload,
  ): Promise<{ data: PolygonOccurrenceResult | null; error: unknown }> {
    return this.service.syncPolygonOccurrences(payload);
  }
}
