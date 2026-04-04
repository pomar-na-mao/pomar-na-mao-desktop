/* eslint-disable @typescript-eslint/naming-convention */

export interface IInspectAnnotation {
  id: string;
  latitude: number;
  longitude: number;
  variety: string | null;
  mass: string | null;
  life_of_the_tree: string | null;
  harvest: string | null;
  planting_date: string | null;
  description: string | null;
  occurrences: Record<string, unknown> | null;
  created_at: string;
  is_approved: boolean;
  updated_at: string | null;
}
