import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HarvestForecastSnapshot } from '../../../../domain/models/harvest-forecast.model';
import { HarvestForecastViewModel } from '../../../view-models/harvest-forecast/harvest-forecast.view-model';
import { HarvestForecastMap } from './harvest-forecast-map';

const snapshot: HarvestForecastSnapshot = {
  year: 2026,
  years: [2026],
  zones: [],
  matched_count: 4,
  total_plants: 30,
  class_counts: { N: 1, P: 1, M: 0, G: 1, GG: 1 },
  forecast_kg: 68,
  markers: [],
};

describe('HarvestForecastMap', () => {
  const viewModel = {
    snapshot: signal<HarvestForecastSnapshot | null>(snapshot),
    selectedMarker: signal(null),
    editClassification: signal('N'),
    saving: signal(false),
    isMapFullscreen: signal(false),
    initMap: vi.fn(),
    destroyMap: vi.fn(),
    setMapFullscreen: vi.fn(),
    invalidateMapSize: vi.fn(),
    closeMarkerEditor: vi.fn(),
    saveMarkerClassification: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    viewModel.snapshot.set(snapshot);
    TestBed.configureTestingModule({
      imports: [HarvestForecastMap],
      providers: [{ provide: HarvestForecastViewModel, useValue: viewModel }],
    });
  });

  it('shows the matched, total and all classification counts', () => {
    const fixture = TestBed.createComponent(HarvestForecastMap);
    fixture.detectChanges();
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(content).toContain('4 / 30 plantas');
    expect(content).toContain('N 1');
    expect(content).toContain('P 1');
    expect(content).toContain('M 0');
    expect(content).toContain('G 1');
    expect(content).toContain('GG 1');
    expect(viewModel.initMap).toHaveBeenCalledWith('harvest-forecast-map');
  });

  it('shows zero counts for an empty result', () => {
    viewModel.snapshot.set({
      ...snapshot,
      matched_count: 0,
      class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 0 },
    });
    const fixture = TestBed.createComponent(HarvestForecastMap);
    fixture.detectChanges();
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(content).toContain('0 / 30 plantas');
    expect(content).toContain('GG 0');
  });
});
