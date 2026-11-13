import type { OrderedMapBoundary } from '../../shared/utils/ordered-map-boundary';

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

export function mipdPlantPartLabel(part: MipdPlantPart): string {
  return MIPD_PLANT_PART_LABELS[part];
}

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

export interface InspectionPlantChange {
  occurrence_id: string;
  occurrence_type_name: string;
  occurrence_type_code?: string;
  action?: string;
  status: string;
  severity: string | null;
  notes: string | null;
  resolved_at: string | null;
  occurred_at?: string | null;
}

export interface InspectionPlant {
  plant_id: string;
  latitude: number;
  longitude: number;
  occurrences: InspectionPlantChange[];
}

export interface InspectionOperationResponse {
  operation_id: string;
  started_at: string;
  finished_at: string | null;
  notes: string | null;
  zone_name: string | null;
  plants: InspectionPlant[];
}

export interface InspectionEntry {
  operation: InspectionOperationResponse;
  plant: InspectionPlant;
}

export interface OverviewVariety {
  id: number;
  name: string;
}

export interface OverviewZone {
  id: string;
  name: string;
  polygon: GeoJSON.Geometry | null;
}

export interface OverviewColoredZone {
  id: string;
  name: string;
  color: string;
  boundary: OrderedMapBoundary | null;
}

export interface OverviewOccurrence {
  id: string;
  name: string;
}

export interface OverviewDiseaseOption {
  id: string;
  name: string;
}

export type OverviewOperationType = 'inspecao' | 'ocorrencia' | '';

export interface OverviewSnapshotFilters {
  plantingStartDate: string | null;
  plantingEndDate: string | null;
}

export interface OverviewSummary {
  totalPlants: number;
  totalZones: number;
  totalOccurrenceTypes: number;
  totalVarieties: number;
  varieties: OverviewVariety[];
}

export interface OverviewPlant {
  id: string;
  latitude: number;
  longitude: number;
  varietyId: number | null;
  varietyName: string | null;
  isDead: boolean;
  nonExistent: boolean;
}

export interface OverviewBoundaryPoint {
  id?: string | null;
  latitude: number;
  longitude: number;
  order: number;
}

export interface OverviewSnapshot {
  summary: OverviewSummary;
  plants: OverviewPlant[];
  farmBoundary: OverviewBoundaryPoint[];
}

export interface OverviewFilterOptions {
  zones: OverviewZone[];
  occurrences: OverviewOccurrence[];
  diseases?: OverviewDiseaseOption[];
}
