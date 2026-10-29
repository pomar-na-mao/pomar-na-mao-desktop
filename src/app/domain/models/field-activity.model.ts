export interface FieldActivityInputItem {
  id: string;
  input_id: string;
  name: string;
  active_ingredient: string | null;
  label_dose: string | null;
  dose_unit: string | null;
  applied_dose: string;
}

export interface FieldActivityItem {
  id: string;
  field_operation_id: string;
  activity: string;
  responsible: string;
  performed_at: string;
  geometry_type: 'route' | 'area';
  geometry_geojson: GeoJSON.GeometryObject | null;
  mixture_id: string | null;
  mixture_name: string | null;
  device_id: string;
  local_id: string;
  created_at: string;
  updated_at: string;
  inputs: FieldActivityInputItem[];
}
