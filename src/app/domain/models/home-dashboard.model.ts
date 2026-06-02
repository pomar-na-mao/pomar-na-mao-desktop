export interface HomeDashboardVariety {
  id: number;
  name: string;
}

export interface HomeDashboardZone {
  id: string;
  name: string;
  polygon: GeoJSON.Geometry | null;
}

export interface HomeDashboardOccurrence {
  id: string;
  name: string;
}

export interface HomeDashboardSummary {
  totalPlants: number;
  totalZones: number;
  totalOccurrenceTypes: number;
  totalVarieties: number;
  varieties: HomeDashboardVariety[];
}

export interface HomeDashboardPlant {
  id: string;
  latitude: number;
  longitude: number;
  varietyId: number | null;
  varietyName: string | null;
}

export interface HomeDashboardSnapshot {
  summary: HomeDashboardSummary;
  plants: HomeDashboardPlant[];
}

export interface HomeDashboardLegendItem {
  label: string;
  color: string;
  varietyId: number | null;
}

export interface HomeDashboardFilterOptions {
  zones: HomeDashboardZone[];
  occurrences: HomeDashboardOccurrence[];
}
