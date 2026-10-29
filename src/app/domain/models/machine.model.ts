export interface MachineItem {
  id: string;
  name: string;
  brand: string | null;
  acquisition_date: string | null;
  manufacturing_year: number | null;
  quantity: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

export type MachineDraft = Omit<MachineItem, 'id' | 'created_at' | 'updated_at'>;

export type MachineCreate = MachineDraft & {
  created_at?: string;
  updated_at?: string;
};

export type MachineUpdate = Partial<MachineDraft> & {
  updated_at?: string;
};
