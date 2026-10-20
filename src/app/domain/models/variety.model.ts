export interface Variety {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type VarietyDraft = Pick<Variety, 'name' | 'description'>;

export type VarietyCreate = VarietyDraft &
  Pick<Variety, 'created_at' | 'updated_at'>;

export type VarietyUpdate = VarietyDraft & Pick<Variety, 'updated_at'>;
