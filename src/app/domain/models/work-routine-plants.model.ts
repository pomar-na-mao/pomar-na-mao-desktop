/* eslint-disable @typescript-eslint/naming-convention */

export interface IWorkRoutinePlants {
  id: string;
  created_at: string;
  routine_id: number | null;
  longitude: number | null;
  latitude: number | null;
  gps_timestamp: number | null;
  mass: string | null;
  variety: string | null;
  harvest: string | null;
  description: string | null;
  planting_date: string | null;
  life_of_the_tree: string | null;
  stick: boolean | null;
  broken_branch: boolean | null;
  vine_growing: boolean | null;
  burnt_branch: boolean | null;
  struck_by_lightning: boolean | null;
  drill: boolean | null;
  anthill: boolean | null;
  in_experiment: boolean | null;
  weeds_in_the_basin: boolean | null;
  fertilization_or_manuring: boolean | null;
  mites: boolean | null;
  thrips: boolean | null;
  empty_collection_box_near: boolean | null;
  is_dead: boolean | null;
  region: string | null;
  updated_at: string;
  plant_id: string;
  is_new: boolean | null;
  non_existent: boolean | null;
  frost: boolean | null;
  flowers: boolean | null;
  buds: boolean | null;
  dehydrated: boolean | null;
  is_approved: boolean;
}
