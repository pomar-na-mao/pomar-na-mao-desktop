export interface OperationInput {
  product_name: string;
  dose: number | null;
  dose_unit: string | null;
  id?: string;
  input_type?: string | null;
  total_quantity?: number | null;
  total_quantity_unit?: string | null;
  active_ingredient?: string | null;
}

export interface SprayingOperationResponse {
  operation_id: string;
  started_at: string;
  finished_at: string | null;
  operator_name: string | null;
  machine_name: string | null;
  machine_brand?: string | null;
  notes: string | null;
  zone_name?: string | null;
  route_geojson: Record<string, unknown> | null;
  inputs: OperationInput[];
  track_points_count: number;
  total_distance_meters?: number | null;
  plants_affected_count?: number | null;
}

export interface InspectionPlantChange {
  occurrence_id: string;
  occurrence_type_name: string;
  occurrence_type_code?: string;
  action?: string;
  status: string;
  severity: string | null;
  notes: string | null;
  resolved_at: string | null;
  occurred_at?: string | null;
}

export interface InspectionPlant {
  plant_id: string;
  latitude: number;
  longitude: number;
  occurrences: InspectionPlantChange[];
}

export interface InspectionOperationResponse {
  operation_id: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  zone_name: string | null;
  plants: InspectionPlant[];
}

export interface InspectionEntry {
  operation: InspectionOperationResponse;
  plant: InspectionPlant;
}
