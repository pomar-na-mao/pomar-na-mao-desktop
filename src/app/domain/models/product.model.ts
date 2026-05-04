export interface Product {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  name: string;
  active_ingredient: string | null;
  category: string | null;
  concentration: number | null;
  unit: string | null;
  manufacturer: string | null;
  notes: string | null;
  is_active: boolean | null;
}

export type ProductInsert = {
  name: string;
  active_ingredient?: string | null;
  category?: string | null;
  concentration?: number | null;
  unit?: string | null;
  manufacturer?: string | null;
  notes?: string | null;
  is_active?: boolean | null;
};

export type ProductUpdate = Partial<ProductInsert>;
