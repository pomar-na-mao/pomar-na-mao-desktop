import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HARVEST_FORECAST_CLASSIFICATIONS,
  HARVEST_FORECAST_CLASSIFICATION_COLORS,
  HARVEST_FORECAST_CLASSIFICATION_LABELS,
} from '../../../../domain/models/harvest-forecast.model';
import { HarvestForecastViewModel } from '../../../view-models/harvest-forecast/harvest-forecast.view-model';
import { HarvestForecastMap } from './harvest-forecast-map';

describe('HarvestForecastMap', () => {
  const viewModel = {
    classifications: HARVEST_FORECAST_CLASSIFICATIONS,
    classificationColors: HARVEST_FORECAST_CLASSIFICATION_COLORS,
    classificationLabels: HARVEST_FORECAST_CLASSIFICATION_LABELS,
    isLoading: signal(false),
    loadError: signal(null),
    showEmptyState: signal(false),
    hasFilterInteraction: signal(false),
    isMapFullscreen: signal(false),
    initMap: vi.fn(),
    destroyMap: vi.fn(),
    invalidateMapSize: vi.fn(),
    setMapFullscreen: vi.fn((value: boolean) => viewModel.isMapFullscreen.set(value)),
    retry: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    viewModel.isMapFullscreen.set(false);
    await TestBed.configureTestingModule({
      imports: [HarvestForecastMap],
      providers: [{ provide: HarvestForecastViewModel, useValue: viewModel }],
    }).compileComponents();
  });

  it('initializes a full-size map and renders an accessible five-item legend', () => {
    const fixture = TestBed.createComponent(HarvestForecastMap);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('#harvest-forecast-map')?.className).toContain('h-full');
    expect(viewModel.initMap).toHaveBeenCalledWith('harvest-forecast-map');
    expect(root.querySelector('[aria-label="Legenda das classificações"]')).toBeTruthy();
    expect(root.textContent).toContain('Muito grande');
    fixture.destroy();
    expect(viewModel.destroyMap).toHaveBeenCalled();
  });

  it('toggles fullscreen and invalidates Leaflet size', () => {
    const fixture = TestBed.createComponent(HarvestForecastMap);
    fixture.detectChanges();
    fixture.componentInstance.toggleFullscreen();
    expect(viewModel.setMapFullscreen).toHaveBeenCalledWith(true);
    expect(viewModel.invalidateMapSize).toHaveBeenCalled();
    expect(document.body.classList.contains('map-fullscreen-active')).toBe(true);
    fixture.destroy();
  });
});
