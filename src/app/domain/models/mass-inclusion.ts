export interface PolygonCoordinate {
    lat: number;
    lng: number;
}

export interface GeoJsonPolygon {
    type: 'Polygon';
    coordinates: number[][][];
}

export interface GeoJsonPolygonFeature {
    type: 'Feature';
    properties: Record<string, unknown>;
    geometry: GeoJsonPolygon;
}

export interface PolygonSelection {
    coordinates: PolygonCoordinate[];
    geoJson: GeoJsonPolygonFeature;
    area?: number;
}

export interface MassInclusionCoordinate {
    lat: number;
    lng: number;
}

export interface MassInclusionData {
    occurrences: string[];
    varietyId: string;
    lifeOfTree: string;
    plantingDate: string;
    description: string;
}

export interface MassInclusionFormValue {
    occurrences: string[];
    variety: string;
    lifeOfTree: string;
    plantingDate: string;
    description: string;
}

export const EMPTY_MASS_INCLUSION_DATA: MassInclusionData = {
    occurrences: [],
    varietyId: '',
    lifeOfTree: '',
    plantingDate: '',
    description: '',
};

export interface MassInclusionVarietyOption {
    id: number;
    name: string;
    description?: string | null;
}

export interface MassInclusionOccurrenceOption {
    id: string;
    code: string;
    name: string;
}

export interface PlantInsidePolygon {
    plantId: string;
    latitude: number;
    longitude: number;
    zoneId: string | null;
    zoneName: string | null;
    varietyId: number | null;
    varietyName: string | null;
    plantingDate: string | null;
}

export interface PolygonBulkSelectedPlant extends PlantInsidePolygon {
    selected: boolean;
    selectionSource: 'polygon_selected' | 'user_removed' | 'user_restored';
}

export interface PolygonBulkOccurrencePayload {
    occurrenceTypeId: string;
    code: string;
    name: string;
    notes?: string | null;
    severity?: string | null;
}

export interface PolygonBulkSelectedPlantPayload {
    plantId: string;
    selectionSource: string;
}

export interface PolygonBulkUpdatePayload {
    polygonGeojson: GeoJsonPolygon;
    plants: PolygonBulkSelectedPlantPayload[];
    plantsFoundCount: number;
    occurrences: PolygonBulkOccurrencePayload[];
    varietyId: number | null;
    lifeOfTree: string | null;
    plantingDate: string | null;
    notes: string | null;
    startedAt: string;
    finishedAt: string;
    localOperationId?: string;
    deviceId?: string;
}

export interface PolygonBulkUpdateResult {
    fieldOperationId: string;
    plantsChangedCount: number;
    occurrencesCreatedCount: number;
    occurrencesUpdatedCount: number;
    attributesUpdatedCount: number;
}
