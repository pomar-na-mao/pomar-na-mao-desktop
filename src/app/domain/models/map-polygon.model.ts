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

export interface MapCoordinate {
  lat: number;
  lng: number;
}

// Backward-compatibility alias
export type BasicDataCoordinate = MapCoordinate;
