import type { OrderedMapBoundary } from '../../shared/utils/ordered-map-boundary';
import type {
  InspectionEntry,
  InspectionOperationResponse,
  InspectionPlant,
} from './operations.model';
import type { MipdMarking } from './mipd.model';

export type {
  InspectionEntry,
  InspectionOperationResponse,
  InspectionPlant,
  MipdMarking,
};

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
