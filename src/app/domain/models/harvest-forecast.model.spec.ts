import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HARVEST_FORECAST_WEIGHTS,
  calculateHarvestForecast,
  cloneHarvestForecastWeights,
  isValidHarvestForecastWeight,
  type HarvestForecastItem,
} from './harvest-forecast.model';

const item = (classification: HarvestForecastItem['classification']): HarvestForecastItem => ({
  forecast_id: crypto.randomUUID(),
  plant_id: crypto.randomUUID(),
  zone_id: null,
  classification,
  collected_at: '2026-11-20T12:00:00Z',
  latitude: -23.4,
  longitude: -49.1,
});

describe('harvest forecast model', () => {
  it('exposes the requested scenario defaults without sharing mutable rows', () => {
    const weights = cloneHarvestForecastWeights();
    expect(weights).toEqual(DEFAULT_HARVEST_FORECAST_WEIGHTS);
    weights.realistic.P = 99;
    expect(DEFAULT_HARVEST_FORECAST_WEIGHTS.realistic.P).toBe(5);
  });

  it('calculates productive subtotals and excludes N', () => {
    const result = calculateHarvestForecast(
      [item('N'), item('P'), item('P'), item('M'), item('G'), item('GG')],
      'realistic',
      cloneHarvestForecastWeights(),
    );

    expect(result.subtotals.P).toMatchObject({ quantity: 2, weightKg: 5, subtotalKg: 10 });
    expect(result.subtotals.M.subtotalKg).toBe(15);
    expect(result.subtotals.G.subtotalKg).toBe(25);
    expect(result.subtotals.GG.subtotalKg).toBe(35);
    expect(result.totalKg).toBe(85);
  });

  it('returns zero for empty and N-only results', () => {
    expect(
      calculateHarvestForecast([item('N')], 'optimistic', cloneHarvestForecastWeights()).totalKg,
    ).toBe(0);
  });

  it('uses edited weights and rejects invalid values', () => {
    const weights = cloneHarvestForecastWeights();
    weights.optimistic.GG = 45.5;
    expect(calculateHarvestForecast([item('GG')], 'optimistic', weights).totalKg).toBe(45.5);
    expect(isValidHarvestForecastWeight(0)).toBe(true);
    expect(isValidHarvestForecastWeight(-1)).toBe(false);
    expect(isValidHarvestForecastWeight(Number.NaN)).toBe(false);
    weights.optimistic.P = Number.NaN;
    expect(() => calculateHarvestForecast([item('P')], 'optimistic', weights)).toThrow();
  });
});
