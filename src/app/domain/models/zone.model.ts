export interface Zone {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  polygon?: any;
  created_at: string;
  updated_at: string;
  local_id: string | null;
  device_id: string | null;
  sync_status: string;
  synced_at: string | null;
}
