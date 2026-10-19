import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type {
  HomeDashboardOccurrence,
  HomeDashboardVariety,
  HomeDashboardZone,
} from '../../../../domain/models/home-dashboard.model';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { DashboardFiltersPanel } from './dashboard-filters-panel';

describe('DashboardFiltersPanel', () => {
  let fixture: ComponentFixture<DashboardFiltersPanel>;
  let component: DashboardFiltersPanel;
  let mockViewModel: {
    filterPlantingStartDate: ReturnType<typeof signal<string>>;
    filterPlantingEndDate: ReturnType<typeof signal<string>>;
    filterZoneId: ReturnType<typeof signal<string | number>>;
    filterOccurrenceId: ReturnType<typeof signal<string | number>>;
    filterPlantStatus: ReturnType<typeof signal<string>>;
    filterVarietyId: ReturnType<typeof signal<string | number>>;
    availableZones: ReturnType<typeof signal<HomeDashboardZone[]>>;
    availableOccurrences: ReturnType<typeof signal<HomeDashboardOccurrence[]>>;
    availableVarieties: ReturnType<typeof signal<HomeDashboardVariety[]>>;
  };

  beforeEach(async () => {
    mockViewModel = {
      filterPlantingStartDate: signal('2026-01-01'),
      filterPlantingEndDate: signal('2026-12-31'),
      filterZoneId: signal('zone-1'),
      filterOccurrenceId: signal('occ-1'),
      filterPlantStatus: signal('alive'),
      filterVarietyId: signal(1),
      availableZones: signal<HomeDashboardZone[]>([{ id: 'z1', name: 'Zona 1' } as unknown as HomeDashboardZone]),
      availableOccurrences: signal<HomeDashboardOccurrence[]>([{ id: 'o1', name: 'Praga 1' } as unknown as HomeDashboardOccurrence]),
      availableVarieties: signal<HomeDashboardVariety[]>([{ id: 1, name: 'Gala' } as unknown as HomeDashboardVariety]),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardFiltersPanel],
      providers: [
        {
          provide: DashboardViewModel,
          useValue: mockViewModel,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFiltersPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render header, date pickers and select dropdowns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Pomar');
    expect(compiled.textContent).toContain('Data de Plantio');
    expect(compiled.querySelectorAll('p-datepicker')).toHaveLength(2);
    expect(compiled.querySelectorAll('app-select')).toHaveLength(4);
  });

  it('should provide options for zones, occurrences, status and varieties', () => {
    expect(component.zoneOptions).toEqual([
      { label: 'Todas as Zonas', value: '' },
      { label: 'Zona 1', value: 'z1' },
    ]);

    expect(component.occurrenceOptions).toEqual([
      { label: 'Todas as Ocorrências', value: '' },
      { label: 'Praga 1', value: 'o1' },
    ]);

    expect(component.plantStatusOptions).toEqual([
      { label: 'Todos os Status', value: '' },
      { label: 'Vivas', value: 'alive', color: '#10b981' },
      { label: 'Mortas', value: 'dead', color: '#ef4444' },
      { label: 'Sem Status', value: 'unknown' },
    ]);

    expect(component.varietyOptions).toEqual([
      { label: 'Todas as Variedades', value: '' },
      { label: 'Gala', value: 1 },
    ]);
  });

  it('should clear all filters when clearFilters is called', () => {
    component.clearFilters();

    expect(mockViewModel.filterPlantingStartDate()).toBe('');
    expect(mockViewModel.filterPlantingEndDate()).toBe('');
    expect(mockViewModel.filterZoneId()).toBe('');
    expect(mockViewModel.filterOccurrenceId()).toBe('');
    expect(mockViewModel.filterPlantStatus()).toBe('');
    expect(mockViewModel.filterVarietyId()).toBe('');
  });
});
