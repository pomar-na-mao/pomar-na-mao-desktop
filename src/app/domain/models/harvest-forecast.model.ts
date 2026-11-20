export const HARVEST_FORECAST_CLASSIFICATIONS = ['N', 'P', 'M', 'G', 'GG'] as const;

export type HarvestForecastClassification =
  (typeof HARVEST_FORECAST_CLASSIFICATIONS)[number];

export const PRODUCTIVE_HARVEST_CLASSIFICATIONS = ['P', 'M', 'G', 'GG'] as const;
export type ProductiveHarvestClassification =
  (typeof PRODUCTIVE_HARVEST_CLASSIFICATIONS)[number];

export const HARVEST_FORECAST_CLASSIFICATION_LABELS: Record<
  HarvestForecastClassification,
  string
> = {
  N: 'Nenhuma',
  P: 'Pequena',
  M: 'Média',
  G: 'Grande',
  GG: 'Muito grande',
};

export const HARVEST_FORECAST_CLASSIFICATION_COLORS: Record<
  HarvestForecastClassification,
  string
> = {
  N: '#64748B',
  P: '#2563EB',
  M: '#EAB308',
  G: '#F97316',
  GG: '#DC2626',
};

export const HARVEST_FORECAST_SCENARIOS = [
  'optimistic',
  'realistic',
  'pessimistic',
] as const;

export type HarvestForecastScenario = (typeof HARVEST_FORECAST_SCENARIOS)[number];

export const HARVEST_FORECAST_SCENARIO_LABELS: Record<HarvestForecastScenario, string> = {
  optimistic: 'Otimista',
  realistic: 'Realista',
  pessimistic: 'Pessimista',
};

export type HarvestForecastWeights = Record<
  HarvestForecastScenario,
  Record<ProductiveHarvestClassification, number>
>;

export const DEFAULT_HARVEST_FORECAST_WEIGHTS: HarvestForecastWeights = {
  optimistic: { P: 6, M: 17, G: 28, GG: 40 },
  realistic: { P: 5, M: 15, G: 25, GG: 35 },
  pessimistic: { P: 4, M: 13, G: 22, GG: 30 },
};

export interface HarvestForecastItem {
  forecast_id: string;
  plant_id: string;
  zone_id: string | null;
  classification: HarvestForecastClassification;
  collected_at: string;
  latitude: number;
  longitude: number;
}

export interface HarvestForecastFilters {
  startDate?: string | null;
  endDate?: string | null;
  classifications?: HarvestForecastClassification[] | null;
  zoneId?: string | null;
}

export interface HarvestForecastSubtotal {
  classification: ProductiveHarvestClassification;
  quantity: number;
  weightKg: number;
  subtotalKg: number;
}

export interface HarvestForecastCalculation {
  scenario: HarvestForecastScenario;
  subtotals: Record<ProductiveHarvestClassification, HarvestForecastSubtotal>;
  totalKg: number;
}

export function cloneHarvestForecastWeights(): HarvestForecastWeights {
  return {
    optimistic: { ...DEFAULT_HARVEST_FORECAST_WEIGHTS.optimistic },
    realistic: { ...DEFAULT_HARVEST_FORECAST_WEIGHTS.realistic },
    pessimistic: { ...DEFAULT_HARVEST_FORECAST_WEIGHTS.pessimistic },
  };
}

export function isValidHarvestForecastWeight(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function calculateHarvestForecast(
  items: readonly HarvestForecastItem[],
  scenario: HarvestForecastScenario,
  weights: HarvestForecastWeights,
): HarvestForecastCalculation {
  const subtotals = {} as Record<
    ProductiveHarvestClassification,
    HarvestForecastSubtotal
  >;

  let totalKg = 0;
  for (const classification of PRODUCTIVE_HARVEST_CLASSIFICATIONS) {
    const weightKg = weights[scenario][classification];
    if (!isValidHarvestForecastWeight(weightKg)) {
      throw new Error(`Peso inválido para ${classification}.`);
    }

    const quantity = items.filter(
      (item) => item.classification === classification,
    ).length;
    const subtotalKg = quantity * weightKg;
    totalKg += subtotalKg;
    subtotals[classification] = {
      classification,
      quantity,
      weightKg,
      subtotalKg,
    };
  }

  return { scenario, subtotals, totalKg };
}
