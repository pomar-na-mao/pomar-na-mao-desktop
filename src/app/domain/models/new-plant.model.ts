/* eslint-disable @typescript-eslint/naming-convention */

export interface INewPlant {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string | null;
  updated_at: string | null;
  gps_timestamp: number | null;
  region: string | null;
  is_approved: boolean;
}
