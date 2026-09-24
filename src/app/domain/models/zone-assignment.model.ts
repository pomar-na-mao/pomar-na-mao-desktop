export interface ZoneAssignmentPlant {
  id: string;
  latitude: number;
  longitude: number;
  zoneId: string | null;
  zoneName?: string | null;
  varietyName?: string | null;
}

export interface ZoneAssignmentPreviewPlant {
  plantId: string;
  latitude: number;
  longitude: number;
  zoneId: string | null;
  zoneName: string | null;
  varietyId: number | null;
  varietyName: string | null;
  plantingDate: string | null;
  selected: boolean;
}

export interface ZonePoint {
  latitude: number;
  longitude: number;
  order: number;
}

export interface AssignZonePayload {
  zoneId: string;
  plantIds: string[];
}

export interface AssignZoneResult {
  zoneId: string;
  zoneName: string;
  plantsUpdatedCount: number;
}
