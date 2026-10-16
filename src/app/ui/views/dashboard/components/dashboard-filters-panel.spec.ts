import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { DashboardFiltersPanel } from './dashboard-filters-panel';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import type {
  HomeDashboardOccurrence,
  HomeDashboardVariety,
  HomeDashboardZone,
} from '../../../../domain/models/home-dashboard.model';

describe('DashboardFiltersPanel', () => {
  it('should render filter fields and provide colored options for status and varieties', () => {
    const mockViewModel = {
      filterPlantingStartDate: signal(''),
      filterPlantingEndDate: signal(''),
      filterZoneId: signal(''),
      filterOccurrenceId: signal(''),
      filterPlantStatus: signal(''),
      filterVarietyId: signal(''),
      availableZones: signal<HomeDashboardZone[]>([]),
      availableOccurrences: signal<HomeDashboardOccurrence[]>([]),
      availableVarieties: signal<HomeDashboardVariety[]>([
        { id: 1, name: 'Gala' },
      ]),
    };

    TestBed.configureTestingModule({
      imports: [DashboardFiltersPanel],
      providers: [
        {
          provide: DashboardViewModel,
          useValue: mockViewModel,
        },
      ],
    });

    const fixture = TestBed.createComponent(DashboardFiltersPanel);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.responsive-filter-shell')).toBeTruthy();
    expect(compiled.querySelector('.ui-form-panel')).toBeTruthy();
    expect(compiled.querySelector('.ui-form-panel-header')).toBeTruthy();
    expect(compiled.querySelector('.ui-form-panel-body')).toBeTruthy();
    expect(compiled.textContent).toContain('Refine os dados exibidos no mapa.');
    expect(compiled.querySelector('summary.responsive-filter-summary')).toBeTruthy();
    expect(compiled.querySelectorAll('app-input input[type="date"]')).toHaveLength(2);
    expect(compiled.querySelectorAll('app-select')).toHaveLength(4);

    const statusTrigger = compiled.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]');
    statusTrigger?.click();
    fixture.detectChanges();
    const filterContent = compiled.querySelector<HTMLElement>('.responsive-filter-content');
    expect(statusTrigger?.getAttribute('aria-expanded')).toBe('true');
    expect(compiled.querySelectorAll('.ui-select-menu [role="option"]')).toHaveLength(3);
    expect(getComputedStyle(filterContent!).overflowY).toBe('visible');

    // Verify filter fields
    expect(compiled.textContent).toContain('Filtros de busca');
    expect(compiled.textContent).toContain('Data de plantio');
    expect(compiled.textContent).toContain('Zona');
    expect(compiled.textContent).toContain('Ocorrência');
    expect(compiled.textContent).toContain('Status da Planta');
    expect(compiled.textContent).toContain('Variedade');

    // Verify legends are removed from sidebar
    expect(compiled.textContent).not.toContain('Legenda de Variedades');

    // Verify plant status options with colors
    const statusOptions = component.plantStatusOptions;
    expect(statusOptions).toEqual([
      { label: 'Todos', value: '' },
      { label: 'Planta viva', value: 'alive', color: '#10b981' },
      { label: 'Ponto vazio', value: 'empty', color: '#ef4444' },
    ]);

    // Verify variety options without colors
    const varietyOptions = component.varietyOptions;
    expect(varietyOptions).toEqual([
      { label: 'Todas as Variedades', value: '' },
      { label: 'Sem variedade', value: 'none' },
      { label: 'Gala', value: '1' },
    ]);
  });
});
