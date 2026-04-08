import type { BooleanKeys } from "./plant-data.model";

export interface PolygonCoordinate {
    lat: number;
    lng: number;
}

export interface PolygonSelection {
    coordinates: PolygonCoordinate[];
    geoJson: object;
    area?: number;
}

export interface MassInclusionCoordinate {
    lat: number;
    lng: number;
}

export interface MassInclusionData {
    occurrences: BooleanKeys[];
    variety: string;
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
    variety: '',
    lifeOfTree: '',
    plantingDate: '',
    description: '',
};

export interface MassUpdatePlantsParams {
    coordinates: PolygonCoordinate[];
    occurrences?: string[];
    variety?: string | null;
    lifeOfTree?: string | null;
    plantingDate?: string | null;
    description?: string | null;
}

export interface MassUpdatePlantsResult {
    message: string;
    updated: number;
    ids: string[];
}