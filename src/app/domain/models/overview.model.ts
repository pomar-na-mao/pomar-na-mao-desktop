export interface OverviewVariety {
  id: number;
  name: string;
}

export interface OverviewZone {
  id: string;
  name: string;
  polygon: GeoJSON.Geometry | null;
}

export interface OverviewOccurrence {
  id: string;
  name: string;
}

export interface OverviewSnapshotFilters {
  plantingStartDate: string | null;
  plantingEndDate: string | null;
}

export interface OverviewSummary {
  totalPlants: number;
  totalZones: number;
  totalOccurrenceTypes: number;
  totalVarieties: number;
  varieties: OverviewVariety[];
}

export interface OverviewPlant {
  id: string;
  latitude: number;
  longitude: number;
  varietyId: number | null;
  varietyName: string | null;
  isDead: boolean;
  nonExistent: boolean;
}

export interface OverviewBoundaryPoint {
  id?: string | null;
  latitude: number;
  longitude: number;
  order: number;
}

export interface OverviewSnapshot {
  summary: OverviewSummary;
  plants: OverviewPlant[];
  farmBoundary: OverviewBoundaryPoint[];
}

export interface OverviewFilterOptions {
  zones: OverviewZone[];
  occurrences: OverviewOccurrence[];
}
