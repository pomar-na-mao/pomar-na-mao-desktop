export interface Zone {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  polygon?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  local_id: string | null;
  device_id: string | null;
  sync_status: string;
  synced_at: string | null;
}

export interface ZoneRegionPointPayload {
  latitude: number;
  longitude: number;
}

export interface CreateZoneWithRegionsPayload {
  name: string;
  code?: string | null;
  description?: string | null;
  polygonGeojson: GeoJSON.Polygon;
  points: ZoneRegionPointPayload[];
}

export interface CreateZoneWithRegionsResult {
  zone_id: string;
  zone_name: string;
  region_points_count: number;
  polygon: GeoJSON.Polygon;
}
