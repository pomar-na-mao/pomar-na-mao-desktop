import type {
  GeoJsonPolygon,
  MapCoordinate,
} from './map-polygon.model';

export interface PolygonOccurrenceOption {
  id: string;
  code: string;
  name: string;
}

export interface PolygonOccurrencePreviewPlant {
  plantId: string;
  latitude: number;
  longitude: number;
  zoneId: string | null;
  zoneName: string | null;
  varietyId: number | null;
  varietyName: string | null;
  plantingDate: string | null;
}

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

export type PolygonOccurrenceCoordinate = MapCoordinate;
export type PolygonOccurrenceGeoJson = GeoJsonPolygon;

