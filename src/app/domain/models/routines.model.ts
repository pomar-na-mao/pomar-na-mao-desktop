import type { PlantData } from "./plant-data.model";


export interface SupabaseRoutine {
  id: string;
  date: string;
  region: string;
  is_done: boolean;
  created_at: string;
  description: string;
  updated_at: string;
  is_review_started?: string;
  users: { full_name: string; email: string };
}

export interface RoutinePlants extends PlantData {
  plant_id: string;
  is_approved: boolean;
  routine_id: number;
}
