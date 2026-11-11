import type {
  BasicDataCoordinate,
  BasicDataOccurrenceOption,
  GeoJsonPolygon,
  PlantInsidePolygon,
} from './basic-data';

export type PolygonOccurrenceAction = 'add' | 'remove';

export interface PolygonOccurrenceFormValue {
  occurrenceAction: PolygonOccurrenceAction;
  occurrences: string[];
}

export interface PolygonOccurrencePayload {
  polygonGeojson: GeoJsonPolygon;
  occurrenceAction: PolygonOccurrenceAction;
  occurrenceTypeIds: string[];
  previewPlantsFoundCount: number;
  zoneId: string | null;
  startedAt: string;
  finishedAt: string;
}

export interface PolygonOccurrenceResult {
  fieldOperationId: string;
  plantsProcessedCount: number;
  plantsChangedCount: number;
  occurrencesCreatedCount: number;
  occurrencesResolvedCount: number;
  occurrencesUnchangedCount: number;
}

export type PolygonOccurrenceCoordinate = BasicDataCoordinate;
export type PolygonOccurrenceOption = BasicDataOccurrenceOption;
export type PolygonOccurrencePreviewPlant = PlantInsidePolygon;
export type PolygonOccurrenceGeoJson = GeoJsonPolygon;

