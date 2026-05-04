export interface SprayingSession {
  id: string;
  created_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  operator_name: string | null;
  status: 'in_progress' | 'completed' | 'cancelled' | null;
  region: string | null;
  notes: string | null;
  water_volume_liters: number | null;
}

export interface SprayingRoutePoint {
  id: string;
  session_id: string;
  latitude: number;
  longitude: number;
  gps_timestamp: number | null;
  accuracy: number | null;
}

export interface SprayingSessionProductRow {
  id: string;
  session_id: string;
  product_id: string;
  dose: number;
  dose_unit: string | null;
}

export interface SprayingProduct {
  id: string;
  session_id: string;
  product_id: string;
  dose: number;
  dose_unit: string | null;
  name: string | null;
  active_ingredient: string | null;
  category: string | null;
  manufacturer: string | null;
}

export interface SprayingSessionPlantRow {
  id: string;
  session_id: string;
  plant_id: string;
  distance_meters: number | null;
  association_method: string | null;
}

export interface SprayingPlant {
  id: string;
  session_id: string;
  plant_id: string;
  distance_meters: number | null;
  association_method: string | null;
  latitude: number;
  longitude: number;
  variety: string | null;
  region: string | null;
  is_dead: boolean | null;
  non_existent: boolean | null;
}

export interface ProductCatalogItem {
  id: string;
  name: string | null;
  active_ingredient: string | null;
  category: string | null;
  manufacturer: string | null;
}

export interface SprayingSessionVisualization {
  session: SprayingSession;
  routePoints: SprayingRoutePoint[];
  plants: SprayingPlant[];
  products: SprayingProduct[];
}
