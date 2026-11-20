export const HARVEST_CLASSIFICATIONS = ['N', 'P', 'M', 'G', 'GG'] as const;
export const HARVEST_WEIGHT_CLASSIFICATIONS = ['GG', 'G', 'M', 'P'] as const;
export const HARVEST_SCENARIOS = ['OTIMISTA', 'REALISTA', 'PESSIMISTA'] as const;

export type HarvestClassification = (typeof HARVEST_CLASSIFICATIONS)[number];
export type HarvestWeightClassification = (typeof HARVEST_WEIGHT_CLASSIFICATIONS)[number];
export type HarvestScenario = (typeof HARVEST_SCENARIOS)[number];
export type HarvestClassificationFilter = HarvestClassification | 'TODAS';

export type HarvestWeights = Record<
  HarvestScenario,
  Record<HarvestWeightClassification, number>
>;

export interface HarvestForecastZone {
  id: string;
  name: string;
}

export interface HarvestForecastMarker {
  id: string;
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_id: string | null;
  zone_name: string | null;
  classification: HarvestClassification;
  created_at: string;
  updated_at: string;
}

export interface HarvestForecastClassCounts {
  N: number;
  P: number;
  M: number;
  G: number;
  GG: number;
}

export interface HarvestForecastSnapshot {
  year: number | null;
  years: number[];
  zones: HarvestForecastZone[];
  matched_count: number;
  total_plants: number;
  class_counts: HarvestForecastClassCounts;
  forecast_kg: number;
  markers: HarvestForecastMarker[];
}

export interface HarvestForecastQuery {
  year?: number | null;
  classification?: HarvestClassificationFilter | null;
  zoneId?: string | null;
  scenario?: HarvestScenario | null;
  weights?: HarvestWeights | null;
}

export interface HarvestForecastUpdate {
  id: string;
  classification: HarvestClassification;
  expectedUpdatedAt: string;
}

export interface HarvestForecastUpdateResult {
  id: string;
  classification: HarvestClassification;
  updated_at: string;
}

export const DEFAULT_HARVEST_WEIGHTS: HarvestWeights = {
  OTIMISTA: { GG: 40, G: 28, M: 17, P: 6 },
  REALISTA: { GG: 35, G: 25, M: 15, P: 5 },
  PESSIMISTA: { GG: 30, G: 22, M: 13, P: 4 },
};

export const cloneHarvestWeights = (
  weights: HarvestWeights = DEFAULT_HARVEST_WEIGHTS,
): HarvestWeights => ({
  OTIMISTA: { ...weights.OTIMISTA },
  REALISTA: { ...weights.REALISTA },
  PESSIMISTA: { ...weights.PESSIMISTA },
});
