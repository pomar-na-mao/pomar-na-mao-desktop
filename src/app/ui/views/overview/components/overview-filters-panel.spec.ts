import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type {
  OverviewOccurrence,
  OverviewVariety,
  OverviewZone,
} from '../../../../domain/models/overview.model';
import { OverviewViewModel } from '../../../view-models/overview/overview.view-model';
import { OverviewFiltersPanel } from './overview-filters-panel';

describe('OverviewFiltersPanel', () => {
  let fixture: ComponentFixture<OverviewFiltersPanel>;
  let component: OverviewFiltersPanel;
  let mockViewModel: {
    filterPlantingStartDate: ReturnType<typeof signal<string>>;
    filterPlantingEndDate: ReturnType<typeof signal<string>>;
    filterZoneId: ReturnType<typeof signal<string | number>>;
    filterOccurrenceId: ReturnType<typeof signal<string | number>>;
    filterPlantStatus: ReturnType<typeof signal<string>>;
    filterVarietyId: ReturnType<typeof signal<string | number>>;
    availableZones: ReturnType<typeof signal<OverviewZone[]>>;
    availableOccurrences: ReturnType<typeof signal<OverviewOccurrence[]>>;
    availableVarieties: ReturnType<typeof signal<OverviewVariety[]>>;
  };

  beforeEach(async () => {
    mockViewModel = {
      filterPlantingStartDate: signal('2026-01-01'),
      filterPlantingEndDate: signal('2026-12-31'),
      filterZoneId: signal('zone-1'),
      filterOccurrenceId: signal('occ-1'),
      filterPlantStatus: signal('alive'),
      filterVarietyId: signal(1),
      availableZones: signal<OverviewZone[]>([{ id: 'z1', name: 'Zona 1' } as unknown as OverviewZone]),
      availableOccurrences: signal<OverviewOccurrence[]>([{ id: 'o1', name: 'Praga 1' } as unknown as OverviewOccurrence]),
      availableVarieties: signal<OverviewVariety[]>([{ id: 1, name: 'Gala' } as unknown as OverviewVariety]),
    };

    await TestBed.configureTestingModule({
      imports: [OverviewFiltersPanel],
      providers: [
        {
          provide: OverviewViewModel,
          useValue: mockViewModel,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewFiltersPanel);
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
