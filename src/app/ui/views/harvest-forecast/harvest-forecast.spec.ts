import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HarvestForecastService } from '../../../data/services/harvest-forecast/harvest-forecast.service';
import type { HarvestForecastSnapshot } from '../../../domain/models/harvest-forecast.model';
import { HarvestForecast } from './harvest-forecast';

const representativeSnapshot: HarvestForecastSnapshot = {
  year: 2026,
  years: [2026, 2025],
  zones: [{ id: 'zone-1', name: 'Norte' }],
  matched_count: 5,
  total_plants: 120,
  class_counts: { N: 1, P: 1, M: 1, G: 1, GG: 1 },
  forecast_kg: 80,
  markers: [
    {
      id: 'forecast-1',
      plant_id: 'plant-1',
      latitude: -23,
      longitude: -49,
      zone_id: 'zone-1',
      zone_name: 'Norte',
      classification: 'P',
      created_at: '2026-03-01T12:00:00+00:00',
      updated_at: '2026-03-01T12:00:00.123456+00:00',
    },
  ],
};

describe('HarvestForecast', () => {
  const getSnapshot = vi.fn();
  const updateClassification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    getSnapshot.mockResolvedValue(representativeSnapshot);
    TestBed.configureTestingModule({
      imports: [HarvestForecast],
      providers: [
        {
          provide: HarvestForecastService,
          useValue: { getSnapshot, updateClassification },
        },
      ],
    });
  });

  it('renders the complete responsive workflow in light and dark themes', async () => {
    const fixture = TestBed.createComponent(HarvestForecast);
    vi.spyOn(fixture.componentInstance.viewModel, 'initMap').mockImplementation(() => {});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector('app-harvest-forecast-panel');

    expect(root.textContent).toContain('Previsão de Safra');
    expect(root.textContent).toContain('Classificação das plantas e estimativa de produção');
    expect(root.textContent).toContain('Cenários');
    expect(root.textContent).toContain('5 / 120 plantas');
    expect(root.querySelector('#harvest-forecast-map')).toBeTruthy();
    expect(panel?.className).toContain('h-[48%]');
    expect(panel?.className).toContain('md:h-full');

    document.documentElement.classList.add('dark');
    fixture.detectChanges();
    expect(root.querySelector('.dark\\:bg-surface-900')).toBeTruthy();
    document.documentElement.classList.remove('dark');
    fixture.destroy();
  });

  it('renders an empty recorte without removing the map or primary action', async () => {
    getSnapshot.mockResolvedValue({
      ...representativeSnapshot,
      matched_count: 0,
      class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 0 },
      forecast_kg: 0,
      markers: [],
    });
    const fixture = TestBed.createComponent(HarvestForecast);
    vi.spyOn(fixture.componentInstance.viewModel, 'initMap').mockImplementation(() => {});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('0 / 120 plantas');
    expect(root.querySelector('#harvest-forecast-map')).toBeTruthy();
    expect(root.textContent).toContain('Previsão');
    fixture.destroy();
  });
});
