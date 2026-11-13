import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  OverviewDiseaseOption,
  OverviewOccurrence,
  OverviewOperationType,
  OverviewVariety,
  OverviewZone,
} from '../../../../domain/models/overview.model';
import { MyOrchardViewModel } from '../../../view-models/my-orchard/my-orchard.view-model';
import { MyOrchardFiltersPanel } from './my-orchard-filters-panel';

describe('MyOrchardFiltersPanel', () => {
  let fixture: ComponentFixture<MyOrchardFiltersPanel>;
  let component: MyOrchardFiltersPanel;
  let mockViewModel: {
    filterPlantingStartDate: ReturnType<typeof signal<string>>;
    filterPlantingEndDate: ReturnType<typeof signal<string>>;
    filterZoneId: ReturnType<typeof signal<string>>;
    filterOccurrenceId: ReturnType<typeof signal<string>>;
    filterPlantStatus: ReturnType<typeof signal<string>>;
    filterVarietyId: ReturnType<typeof signal<string | number>>;
    selectedOccurrenceIds: ReturnType<typeof signal<string[]>>;
    selectedDiseaseIds: ReturnType<typeof signal<string[]>>;
    operationStartDate: ReturnType<typeof signal<string>>;
    operationEndDate: ReturnType<typeof signal<string>>;
    selectedOperationType: ReturnType<typeof signal<OverviewOperationType>>;
    availableZones: ReturnType<typeof signal<OverviewZone[]>>;
    availableOccurrences: ReturnType<typeof signal<OverviewOccurrence[]>>;
    availableDiseases: ReturnType<typeof signal<OverviewDiseaseOption[]>>;
    availableVarieties: ReturnType<typeof signal<OverviewVariety[]>>;
    clearFilters: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockViewModel = {
      filterPlantingStartDate: signal('2026-01-01'),
      filterPlantingEndDate: signal('2026-12-31'),
      filterZoneId: signal('zone-1'),
      filterOccurrenceId: signal('occ-1'),
      filterPlantStatus: signal('alive'),
      filterVarietyId: signal(1),
      selectedOccurrenceIds: signal<string[]>(['occ-1']),
      selectedDiseaseIds: signal<string[]>(['dis-1']),
      operationStartDate: signal('2026-05-01'),
      operationEndDate: signal('2026-05-30'),
      selectedOperationType: signal<OverviewOperationType>('inspecao'),
      availableZones: signal<OverviewZone[]>([{ id: 'z1', name: 'Zona 1' } as unknown as OverviewZone]),
      availableOccurrences: signal<OverviewOccurrence[]>([{ id: 'o1', name: 'Praga 1' } as unknown as OverviewOccurrence]),
      availableDiseases: signal<OverviewDiseaseOption[]>([{ id: 'd1', name: 'Doenca 1' }]),
      availableVarieties: signal<OverviewVariety[]>([{ id: 1, name: 'Gala' } as unknown as OverviewVariety]),
      clearFilters: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MyOrchardFiltersPanel],
      providers: [
        {
          provide: MyOrchardViewModel,
          useValue: mockViewModel,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyOrchardFiltersPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render header, date pickers and select dropdowns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Meu Pomar');
    expect(compiled.textContent).toContain('Período da Operação');
    expect(compiled.querySelectorAll('p-datepicker')).toHaveLength(4);
    expect(compiled.querySelectorAll('app-select')).toHaveLength(6);
  });

  it('should provide options for zones, occurrences, diseases, operations, status and varieties', () => {
    expect(component.zoneOptions).toEqual([
      { label: 'Todos os Talhões', value: '' },
      { label: 'Zona 1', value: 'z1' },
    ]);

    expect(component.occurrenceOptions).toEqual([
      { label: 'Praga 1', value: 'o1' },
    ]);

    expect(component.diseaseOptions).toEqual([
      { label: 'Doenca 1', value: 'd1' },
    ]);

    expect(component.operationOptions).toEqual([
      { label: 'Nenhuma / Não filtrar', value: '' },
      { label: 'Inspeção Manual', value: 'inspecao' },
      { label: 'Anotação / Ocorrência', value: 'ocorrencia' },
    ]);

    expect(component.plantStatusOptions).toEqual([
      { label: 'Todos os Status', value: '' },
      { label: 'Vivas', value: 'alive', color: '#10b981' },
      { label: 'Não existentes', value: 'non_existent', color: '#ef4444' },
    ]);

    expect(component.varietyOptions).toEqual([
      { label: 'Todas as Variedades', value: '' },
      { label: 'Gala', value: '1' },
    ]);
  });

  it('should clear all filters when clearFilters is called', () => {
    component.clearFilters();
    expect(mockViewModel.clearFilters).toHaveBeenCalled();
  });

  it('should focus end date picker when operation start date changes with value', () => {
    const focusSpy = vi.spyOn(component, 'focusOperationEndDate');
    component.onOperationStartDateChange('2026-06-15');

    expect(mockViewModel.operationStartDate()).toBe('2026-06-15');
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should not focus end date picker when operation start date is cleared', () => {
    const focusSpy = vi.spyOn(component, 'focusOperationEndDate');
    component.onOperationStartDateChange(null);

    expect(mockViewModel.operationStartDate()).toBe('');
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should focus end date picker on select event', () => {
    const focusSpy = vi.spyOn(component, 'focusOperationEndDate');
    component.onOperationStartDateSelect();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should trigger focus on input nativeElement during focusOperationEndDate', async () => {
    vi.useFakeTimers();
    const mockFocus = vi.fn();
    component.operationEndDatePicker = {
      inputfieldViewChild: {
        nativeElement: {
          focus: mockFocus,
        },
      },
    } as unknown as typeof component.operationEndDatePicker;

    component.focusOperationEndDate();
    vi.runAllTimers();

    expect(mockFocus).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
