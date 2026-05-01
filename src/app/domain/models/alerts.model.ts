export interface Alerts {
  id: string;
  created_at: string;
  title: string;
  region: string;
  row: number | null;
  number_of_tree: number | null;
  description: string | null;
  is_active: boolean;
}
