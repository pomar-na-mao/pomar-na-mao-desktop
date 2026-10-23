export const MIPD_PLANT_PARTS = [
  'LEAF',
  'BRANCH',
  'TRUNK',
  'ROOT',
  'FRUIT',
] as const;

export type MipdPlantPart = (typeof MIPD_PLANT_PARTS)[number];

export const MIPD_PLANT_PART_LABELS: Record<MipdPlantPart, string> = {
  LEAF: 'Folha',
  BRANCH: 'Ramo',
  TRUNK: 'Tronco',
  ROOT: 'Raiz',
  FRUIT: 'Fruto',
};

export interface MipdMarking {
  operation_id: string;
  marking_id: string;
  started_at: string;
  observed_at: string;
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_name: string | null;
  occurrence_type_id: string;
  occurrence_type_name: string;
  plant_parts: MipdPlantPart[];
  photo_object_path: string | null;
}

export interface MipdPlantMarkings {
  plantId: string;
  latitude: number;
  longitude: number;
  markings: MipdMarking[];
}

export function mipdPlantPartLabel(part: MipdPlantPart): string {
  return MIPD_PLANT_PART_LABELS[part];
}

