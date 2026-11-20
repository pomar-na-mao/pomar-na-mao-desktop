import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HarvestForecastRepository } from '../../../data/repositories/harvest-forecast/harvest-forecast.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { HarvestForecastItem } from '../../../domain/models/harvest-forecast.model';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import { HarvestForecastViewModel } from './harvest-forecast.view-model';

const forecast = (
  plantId: string,
  classification: HarvestForecastItem['classification'],
  latitude = -23.4,
  longitude = -49.1,
): HarvestForecastItem => ({
  forecast_id: `f-${plantId}`,
  plant_id: plantId,
  zone_id: 'z1',
  classification,
  collected_at: '2026-11-20T10:00:00Z',
  latitude,
  longitude,
});

describe('HarvestForecastViewModel', () => {
  const items = signal<HarvestForecastItem[]>([]);
  const loading = signal(false);
  const error = signal<never | null>(null);
  const zones = signal<Zone[]>([
    {
      id: 'z1',
      name: 'Zona 1',
      code: null,
      description: null,
      created_at: '',
      updated_at: '',
      local_id: null,
      device_id: null,
      sync_status: 'synced',
      synced_at: null,
    },
    {
      id: 'z2',
      name: 'Zona inválida',
      code: null,
      description: null,
      created_at: '',
      updated_at: '',
      local_id: null,
      device_id: null,
      sync_status: 'synced',
      synced_at: null,
    },
  ]);
  const regions = signal<Region[]>([
    {
      id: 'r1',
      zone_id: 'z1',
      latitude: -23.4,
      longitude: -49.1,
      order: 2,
      region: '1',
      created_at: '',
    },
    {
      id: 'r2',
      zone_id: 'z1',
      latitude: -23.41,
      longitude: -49.11,
      order: 1,
      region: '1',
      created_at: '',
    },
    {
      id: 'r3',
      zone_id: 'z1',
      latitude: -23.42,
      longitude: -49.12,
      order: 3,
      region: '1',
      created_at: '',
    },
    {
      id: 'r4',
      zone_id: 'z2',
      latitude: -23.5,
      longitude: -49.2,
      order: 1,
      region: '2',
      created_at: '',
    },
  ]);
  const findAll = vi.fn().mockResolvedValue({ error: null });
  const clear = vi.fn(() => {
    items.set([]);
    error.set(null);
    loading.set(false);
  });
  let viewModel: HarvestForecastViewModel;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    items.set([]);
    error.set(null);
    TestBed.configureTestingModule({
      providers: [
        HarvestForecastViewModel,
        {
          provide: HarvestForecastRepository,
          useValue: { items, isLoading: loading, error, findAll, clear },
        },
        {
          provide: ZonesRepository,
          useValue: {
            zones,
            findAll: vi.fn().mockResolvedValue({ error: null }),
          },
        },
        {
          provide: RegionsRepository,
          useValue: {
            regions,
            findAll: vi.fn().mockResolvedValue({ error: null }),
          },
        },
        {
          provide: FarmBoundaryService,
          useValue: {
            getBoundary: vi.fn().mockResolvedValue([
              { latitude: -23.4, longitude: -49.1, order: 1 },
              { latitude: -23.41, longitude: -49.11, order: 2 },
              { latitude: -23.42, longitude: -49.12, order: 3 },
            ]),
          },
        },
      ],
    });
    viewModel = TestBed.inject(HarvestForecastViewModel);
    TestBed.flushEffects();
  });

  afterEach(() => vi.useRealTimers());

  it('loads valid territory without querying forecasts initially', async () => {
    await viewModel.loadInitialData();
    expect(viewModel.farmPolygon()?.length).toBe(3);
    expect(viewModel.zonePolygons()).toHaveLength(1);
    expect(viewModel.zonePolygons()[0].points[0]).toEqual([-23.41, -49.11]);
    expect(findAll).not.toHaveBeenCalled();
    expect(viewModel.markerDescriptors()).toEqual([]);
  });

  it('debounces and composes valid filter changes while rejecting inverted dates', async () => {
    viewModel.setStartDate('2026-11-20');
    viewModel.setEndDate('2026-11-01');
    await vi.runAllTimersAsync();
    expect(viewModel.dateError()).toBeTruthy();
    expect(findAll).not.toHaveBeenCalled();

    viewModel.setEndDate('2026-11-30');
    viewModel.setClassifications('GG');
    viewModel.setZoneId('z1');
    await vi.runAllTimersAsync();
    expect(findAll).toHaveBeenLastCalledWith({
      startDate: '2026-11-20',
      endDate: '2026-11-30',
      classifications: ['GG'],
      zoneId: 'z1',
    });
  });

  it('omits the classification filter when Todas is selected', async () => {
    expect(viewModel.selectedClassifications()).toEqual([]);

    viewModel.setZoneId('z1');
    await vi.runAllTimersAsync();

    expect(findAll).toHaveBeenLastCalledWith({
      startDate: null,
      endDate: null,
      classifications: null,
      zoneId: 'z1',
    });

    viewModel.setClassifications('P');
    await vi.runAllTimersAsync();
    viewModel.setClassifications('');
    await vi.runAllTimersAsync();
    expect(findAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ classifications: null }),
    );
  });

  it('deduplicates markers, rejects invalid coordinates and maps every color', () => {
    items.set([
      forecast('p1', 'N'),
      forecast('p1', 'GG'),
      forecast('p2', 'P'),
      forecast('p3', 'M'),
      forecast('p4', 'G'),
      forecast('p5', 'GG'),
      forecast('invalid', 'P', Number.NaN),
    ]);
    TestBed.flushEffects();
    expect(
      viewModel.markerDescriptors().map((item) => item.classification),
    ).toEqual(['N', 'P', 'M', 'G', 'GG']);
    expect(viewModel.markerDescriptors().map((item) => item.color)).toEqual([
      '#64748B',
      '#2563EB',
      '#EAB308',
      '#F97316',
      '#DC2626',
    ]);
  });

  it('calculates with edited weights and invalidates on any dependent change', () => {
    items.set([forecast('p1', 'N'), forecast('p2', 'P'), forecast('p3', 'GG')]);
    viewModel.calculate();
    expect(viewModel.calculation()?.totalKg).toBe(40);

    viewModel.setWeight('realistic', 'GG', 40);
    expect(viewModel.calculation()).toBeNull();
    viewModel.calculate();
    expect(viewModel.calculation()?.totalKg).toBe(45);
    viewModel.setScenario('optimistic');
    expect(viewModel.calculation()).toBeNull();
  });

  it('clears markers and calculation while retaining territory', async () => {
    await viewModel.loadInitialData();
    items.set([forecast('p1', 'P')]);
    viewModel.calculate();
    viewModel.clearFilters();
    TestBed.flushEffects();
    expect(clear).toHaveBeenCalled();
    expect(viewModel.markerDescriptors()).toEqual([]);
    expect(viewModel.calculation()).toBeNull();
    expect(viewModel.farmPolygon()?.length).toBe(3);
    expect(viewModel.zonePolygons()).toHaveLength(1);
  });
});
