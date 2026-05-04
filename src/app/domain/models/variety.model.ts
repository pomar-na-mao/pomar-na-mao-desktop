export interface Variety {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export type VarietyInsert = {
  name: string;
  description?: string | null;
};

export type VarietyUpdate = Partial<VarietyInsert>;
