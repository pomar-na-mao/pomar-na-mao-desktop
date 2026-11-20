import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HarvestForecastService } from '../../../data/services/harvest-forecast/harvest-forecast.service';
import { MessageService } from '../../../data/services/message/message.service';
import type {
  HarvestForecastMarker,
  HarvestForecastSnapshot,
} from '../../../domain/models/harvest-forecast.model';
import { HarvestForecastViewModel } from './harvest-forecast.view-model';

const marker = (
  id: string,
  classification: HarvestForecastMarker['classification'] = 'P',
): HarvestForecastMarker => ({
  id,
  plant_id: 'plant-' + id,
  latitude: -23,
  longitude: -49,
  zone_id: 'zone-1',
  zone_name: 'Norte',
  classification,
  created_at: '2026-03-01T12:00:00+00:00',
  updated_at: '2026-03-01T12:00:00.123456+00:00',
});

const makeSnapshot = (
  overrides: Partial<HarvestForecastSnapshot> = {},
): HarvestForecastSnapshot => ({
  year: 2026,
  years: [2026, 2025],
  zones: [
    { id: 'zone-1', name: 'Norte' },
    { id: 'zone-2', name: 'Sul' },
  ],
  matched_count: 2,
  total_plants: 20,
  class_counts: { N: 0, P: 1, M: 0, G: 0, GG: 1 },
  forecast_kg: 40,
  markers: [marker('one'), marker('two', 'GG')],
  ...overrides,
});

describe('HarvestForecastViewModel', () => {
  const getSnapshot = vi.fn();
  const updateClassification = vi.fn();
  const messages = { success: vi.fn(), error: vi.fn() };
  let viewModel: HarvestForecastViewModel;

  beforeEach(() => {
    vi.clearAllMocks();
    getSnapshot.mockResolvedValue(makeSnapshot());
    TestBed.configureTestingModule({
      providers: [
        HarvestForecastViewModel,
        {
          provide: HarvestForecastService,
          useValue: { getSnapshot, updateClassification },
        },
        { provide: MessageService, useValue: messages },
      ],
    });
    viewModel = TestBed.inject(HarvestForecastViewModel);
  });

  it('loads the latest year and keeps the default filters', async () => {
    await viewModel.initialize();

    expect(viewModel.selectedYear()).toBe(2026);
    expect(viewModel.selectedClassification()).toBe('TODAS');
    expect(viewModel.selectedZoneId()).toBe('');
    expect(viewModel.selectedScenario()).toBe('REALISTA');
    expect(viewModel.yearOptions()).toEqual([
      { label: '2026', value: 2026 },
      { label: '2025', value: 2025 },
    ]);
    expect(viewModel.zoneOptions()).toEqual([
      { label: 'Todas', value: '' },
      { label: 'Norte', value: 'zone-1' },
      { label: 'Sul', value: 'zone-2' },
    ]);
  });

  it('discards a response from an obsolete filter request', async () => {
    let resolveFirst!: (value: HarvestForecastSnapshot) => void;
    getSnapshot
      .mockImplementationOnce(
        () =>
          new Promise<HarvestForecastSnapshot>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(makeSnapshot({ year: 2025, years: [2025] }));

    const first = viewModel.initialize();
    const second = viewModel.setYear(2025);
    await second;
    resolveFirst(makeSnapshot({ year: 2026 }));
    await first;

    expect(viewModel.snapshot()?.year).toBe(2025);
    expect(viewModel.selectedYear()).toBe(2025);
  });

  it('starts with all twelve scenario weights and edits zero and decimal values', () => {
    expect(viewModel.weights()).toEqual({
      OTIMISTA: { GG: 40, G: 28, M: 17, P: 6 },
      REALISTA: { GG: 35, G: 25, M: 15, P: 5 },
      PESSIMISTA: { GG: 30, G: 22, M: 13, P: 4 },
    });

    viewModel.beginWeightEdit('REALISTA', 'P');
    viewModel.weightDraft.set('0');
    expect(viewModel.confirmWeightEdit()).toBe(true);
    expect(viewModel.weights().REALISTA.P).toBe(0);

    viewModel.beginWeightEdit('OTIMISTA', 'GG');
    viewModel.weightDraft.set('40,5');
    expect(viewModel.confirmWeightEdit()).toBe(true);
    expect(viewModel.weights().OTIMISTA.GG).toBe(40.5);
  });

  it('preserves a weight when editing is cancelled or invalid', () => {
    viewModel.beginWeightEdit('PESSIMISTA', 'M');
    viewModel.weightDraft.set('20');
    viewModel.cancelWeightEdit();
    expect(viewModel.weights().PESSIMISTA.M).toBe(13);

    viewModel.beginWeightEdit('PESSIMISTA', 'M');
    viewModel.weightDraft.set('-1');
    expect(viewModel.confirmWeightEdit()).toBe(false);
    expect(viewModel.weights().PESSIMISTA.M).toBe(13);
    expect(viewModel.weightError()).toContain('igual ou maior');
  });

  it('invalidates a calculated result after scenario, filter or weight changes', async () => {
    await viewModel.calculateForecast();
    expect(viewModel.forecastResult()).not.toBeNull();

    viewModel.setScenario('OTIMISTA');
    expect(viewModel.forecastResult()).toBeNull();

    await viewModel.calculateForecast();
    viewModel.beginWeightEdit('OTIMISTA', 'P');
    viewModel.weightDraft.set('7');
    viewModel.confirmWeightEdit();
    expect(viewModel.forecastResult()).toBeNull();

    await viewModel.calculateForecast();
    await viewModel.setClassification('GG');
    expect(viewModel.forecastResult()).toBeNull();
  });

  it('keeps map counts and empty markers from the same snapshot', async () => {
    getSnapshot.mockResolvedValue(
      makeSnapshot({
        matched_count: 0,
        class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 0 },
        markers: [],
      }),
    );

    await viewModel.initialize();

    expect(viewModel.snapshot()?.matched_count).toBe(0);
    expect(viewModel.snapshot()?.markers).toEqual([]);
    expect(viewModel.snapshot()?.class_counts).toEqual({
      N: 0,
      P: 0,
      M: 0,
      G: 0,
      GG: 0,
    });
  });

  it('updates a marker and refreshes an active forecast', async () => {
    await viewModel.calculateForecast();
    viewModel.selectMarker(marker('one'));
    viewModel.editClassification.set('GG');
    updateClassification.mockResolvedValue({
      id: 'one',
      classification: 'GG',
      updated_at: '2026-03-02T00:00:00+00:00',
    });
    getSnapshot.mockResolvedValueOnce(
      makeSnapshot({
        matched_count: 1,
        class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 1 },
        markers: [marker('one', 'GG')],
      }),
    );

    await viewModel.saveMarkerClassification();

    expect(updateClassification).toHaveBeenCalledWith({
      id: 'one',
      classification: 'GG',
      expectedUpdatedAt: '2026-03-01T12:00:00.123456+00:00',
    });
    expect(viewModel.selectedMarker()).toBeNull();
    expect(viewModel.forecastResult()?.markers).toHaveLength(1);
    expect(messages.success).toHaveBeenCalledOnce();
  });

  it('refreshes latest data and reports a concurrency conflict', async () => {
    viewModel.selectMarker(marker('one'));
    updateClassification.mockRejectedValue({ code: 'P0002' });
    getSnapshot.mockResolvedValueOnce(
      makeSnapshot({ markers: [marker('one', 'M')] }),
    );

    await viewModel.saveMarkerClassification();

    expect(viewModel.snapshot()?.markers[0].classification).toBe('M');
    expect(messages.error).toHaveBeenCalledWith(
      expect.stringContaining('mudou desde a consulta'),
    );
  });

  it('reports a generic edit error when the marker leaves the filter', async () => {
    await viewModel.setClassification('P');
    viewModel.selectMarker(marker('one'));
    viewModel.editClassification.set('GG');
    updateClassification.mockRejectedValue({ code: '42501' });
    getSnapshot.mockResolvedValueOnce(
      makeSnapshot({
        matched_count: 0,
        class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 0 },
        markers: [],
      }),
    );

    await viewModel.saveMarkerClassification();

    expect(viewModel.snapshot()?.markers).toEqual([]);
    expect(messages.error).toHaveBeenCalledWith(
      'Não foi possível atualizar a classificação.',
    );
  });
});
