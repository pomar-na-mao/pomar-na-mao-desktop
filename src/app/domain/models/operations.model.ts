export interface OperationInput {
  product_name: string;
  dose: number | null;
  dose_unit: string | null;
}

export interface SprayingOperationResponse {
  operation_id: string;
  started_at: string;
  finished_at: string | null;
  operator_name: string | null;
  machine_name: string | null;
  notes: string | null;
  route_geojson: Record<string, unknown> | null;
  inputs: OperationInput[];
  track_points_count: number;
}
