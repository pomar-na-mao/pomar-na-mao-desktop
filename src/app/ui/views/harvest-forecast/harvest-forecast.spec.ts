import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HarvestForecastRepository } from '../../../data/repositories/harvest-forecast/harvest-forecast.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { HarvestForecastItem } from '../../../domain/models/harvest-forecast.model';
import { Select } from '../../../shared/components/select/select';
import { HarvestForecast } from './harvest-forecast';

describe('HarvestForecast screen', () => {
  const items = signal<HarvestForecastItem[]>([]);
  const isLoading = signal(false);
  const error = signal<never | null>(null);
  const findAll = vi.fn().mockResolvedValue({ error: null });
  const clear = vi.fn(() => items.set([]));

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [HarvestForecast],
      providers: [
        {
          provide: HarvestForecastRepository,
          useValue: { items, isLoading, error, findAll, clear },
        },
        {
          provide: ZonesRepository,
          useValue: {
            zones: signal([]),
            findAll: vi.fn().mockResolvedValue({ error: null }),
          },
        },
        {
          provide: RegionsRepository,
          useValue: {
            regions: signal([]),
            findAll: vi.fn().mockResolvedValue({ error: null }),
          },
        },
        {
          provide: FarmBoundaryService,
          useValue: { getBoundary: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();
    items.set([]);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders the responsive Meu Pomar proportions and all forecast controls', () => {
    const fixture = TestBed.createComponent(HarvestForecast);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const panel = root.querySelector('app-harvest-forecast-filters-panel');
    expect(panel?.className).toContain('md:w-96');
    expect(panel?.className).toContain('lg:w-[25rem]');
    expect(root.querySelector('[data-horizontal-scroll]')).toBeNull();
    expect(root.textContent).toContain('Período de coleta');
    expect(root.textContent).toContain('Classificação');
    expect(root.textContent).toContain('Estimativa');
    expect(root.textContent).toContain('Produção por classificação');
    const estimateRows = root.querySelectorAll(
      '[data-estimate-classification]',
    );
    expect(estimateRows).toHaveLength(4);
    const expectedEstimateLabels = [
      'Pequena',
      'Média',
      'Grande',
      'Muito grande',
    ];
    estimateRows.forEach((row, index) => {
      expect(row.textContent?.replace(/\s+/g, ' ').trim()).toBe(
        `${expectedEstimateLabels[index]} —`,
      );
      expect(
        row.querySelector('[data-classification-color]')?.getAttribute('style'),
      ).toContain('background-color');
    });
    const fieldLabels = Array.from(root.querySelectorAll('label')).filter(
      (label) =>
        [
          'Período de coleta',
          'Classificação',
          'Zona',
          'Cenário da previsão',
        ].includes(label.textContent?.trim() ?? ''),
    );
    expect(fieldLabels).toHaveLength(4);
    for (const label of fieldLabels) {
      expect(label.className).toContain('text-md');
      expect(label.className).toContain('font-medium');
    }
    const screenTitle = root.querySelector('h4');
    expect(screenTitle?.textContent).toContain('Previsão de Safra');
    expect(screenTitle?.className).toBe(
      'font-bold text-surface-900 dark:text-surface-0 leading-none',
    );
    expect(root.querySelector('[aria-label="Filtros"]')).toBeTruthy();
    expect(root.querySelector('[aria-label="Cenários"]')).toBeTruthy();
    expect(root.querySelector('#forecast-filters-title')).toBeNull();
    expect(root.querySelector('#scenario-title')).toBeNull();
    expect(root.querySelectorAll('h2')).toHaveLength(0);
    expect(root.querySelector('#forecast-estimate-title')?.tagName).toBe(
      'H4',
    );
    expect(root.querySelectorAll('p-datepicker')).toHaveLength(2);
    const weightInputs = root.querySelectorAll('input[type="number"]');
    expect(weightInputs).toHaveLength(12);
    for (const input of weightInputs) {
      expect(input.className).toContain('min-h-11');
      expect(input.className).toContain('text-sm');
      expect(input.className).toContain('[appearance:textfield]');
      expect(input.className).toContain(
        '[&::-webkit-inner-spin-button]:appearance-none',
      );
      expect(input.className).toContain(
        '[&::-webkit-outer-spin-button]:appearance-none',
      );
    }
    const classificationSelect = fixture.debugElement
      .queryAll(By.directive(Select))
      .map((element) => element.componentInstance as Select)
      .find((select) => select.label === 'Classificação');
    expect(classificationSelect?.value).toBe('');
    expect(classificationSelect?.options.map((option) => option.label)).toEqual(
      [
        'Todas',
        'N — Nenhuma',
        'P — Pequena',
        'M — Média',
        'G — Grande',
        'GG — Muito grande',
      ],
    );
    expect(findAll).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('supports the complete filter, result, edit and invalidation flow without Supabase', async () => {
    const fixture = TestBed.createComponent(HarvestForecast);
    fixture.detectChanges();
    const viewModel = fixture.componentInstance.viewModel;

    viewModel.setClassifications('P');
    await vi.runAllTimersAsync();
    expect(findAll).toHaveBeenCalledWith(
      expect.objectContaining({ classifications: ['P'] }),
    );

    items.set([
      {
        forecast_id: 'f1',
        plant_id: 'p1',
        zone_id: null,
        classification: 'P',
        collected_at: '2026-11-20T10:00:00Z',
        latitude: -23.4,
        longitude: -49.1,
      },
      {
        forecast_id: 'f2',
        plant_id: 'p2',
        zone_id: null,
        classification: 'GG',
        collected_at: '2026-11-20T10:00:00Z',
        latitude: -23.41,
        longitude: -49.11,
      },
    ]);
    TestBed.flushEffects();
    viewModel.setWeight('realistic', 'GG', 40);
    viewModel.calculate();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '45 kg',
    );

    viewModel.setScenario('optimistic');
    fixture.detectChanges();
    expect(viewModel.calculation()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Total estimado',
    );
    fixture.destroy();
  });
});
