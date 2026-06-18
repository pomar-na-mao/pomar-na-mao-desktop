import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationsMapDetailsCard } from './operations-map-details-card';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { signal, WritableSignal } from '@angular/core';
import { SprayingOperationResponse, InspectionOperationResponse, InspectionPlant, InspectionEntry } from '../../../../domain/models/operations.model';

describe('OperationsMapDetailsCard', () => {
  let component: OperationsMapDetailsCard;
  let fixture: ComponentFixture<OperationsMapDetailsCard>;
  let mockViewModel: {
    selectedOperation: WritableSignal<string>;
    selectedOperationDetails: WritableSignal<SprayingOperationResponse | null>;
    selectedInspectionDetails: WritableSignal<InspectionOperationResponse | null>;
    selectedInspectionPlant: WritableSignal<InspectionPlant | null>;
    inspectionEntriesForPlant: WritableSignal<InspectionEntry[]>;
    currentInspectionIndex: WritableSignal<number>;
    clearInspectionSelection: () => void;
    navigateInspection: (direction: 'prev' | 'next') => void;
  };

  beforeEach(async () => {
    mockViewModel = {
      selectedOperation: signal<string>('inspecao'),
      selectedOperationDetails: signal<SprayingOperationResponse | null>(null),
      selectedInspectionDetails: signal<InspectionOperationResponse | null>(null),
      selectedInspectionPlant: signal<InspectionPlant | null>(null),
      inspectionEntriesForPlant: signal<InspectionEntry[]>([]),
      currentInspectionIndex: signal<number>(0),
      clearInspectionSelection: () => {
        mockViewModel.selectedInspectionDetails.set(null);
        mockViewModel.selectedInspectionPlant.set(null);
        mockViewModel.inspectionEntriesForPlant.set([]);
        mockViewModel.currentInspectionIndex.set(0);
      },
      navigateInspection: (direction: 'prev' | 'next') => {
        void direction;
      }
    };

    await TestBed.configureTestingModule({
      imports: [OperationsMapDetailsCard],
      providers: [
        { provide: OperationsViewModel, useValue: mockViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsMapDetailsCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render details when available', () => {
    mockViewModel.selectedOperationDetails.set({
      operation_id: '1',
      started_at: '2023-01-01T00:00:00Z',
      finished_at: '2023-01-01T01:00:00Z',
      operator_name: 'John Doe',
      machine_name: 'Tractor 1',
      notes: null,
      track_points_count: 50,
      inputs: [{ product_name: 'Fertilizer A', dose: 10, dose_unit: 'L' }],
      route_geojson: null
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('Tractor 1');
    expect(compiled.textContent).toContain('Fertilizer A');
  });

  it('should close the card', () => {
    mockViewModel.selectedOperationDetails.set({
      operation_id: '1',
      started_at: '2023-01-01T00:00:00Z',
      finished_at: '2023-01-01T01:00:00Z',
      operator_name: 'John Doe',
      machine_name: 'Tractor 1',
      notes: null,
      track_points_count: 50,
      inputs: [],
      route_geojson: null
    });
    fixture.detectChanges();

    component.close();
    expect(mockViewModel.selectedOperationDetails()).toBeNull();
  });

  it('should render inspection details when available', () => {
    mockViewModel.selectedInspectionDetails.set({
      operation_id: '2',
      started_at: '2023-01-01T00:00:00Z',
      finished_at: '2023-01-01T01:00:00Z',
      notes: 'Test inspection notes',
      zone_name: 'Zone A',
      plants: []
    });
    mockViewModel.selectedInspectionPlant.set({
      plant_id: 'plant-uuid-12345678',
      latitude: 10,
      longitude: 20,
      occurrences: [
        { occurrence_id: 'o1', occurrence_type_name: 'Praga A', status: 'open', severity: 'Média', notes: 'Na folha', resolved_at: null },
        { occurrence_id: 'o2', occurrence_type_name: 'Praga B', status: 'removed', severity: null, notes: 'Resolvido', resolved_at: '2023-01-01T01:00:00Z' }
      ]
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inspeção Manual');
    expect(compiled.textContent).toContain('Zone A');
    expect(compiled.textContent).toContain('Praga A');
    expect(compiled.textContent).toContain('Praga B');
    expect(compiled.textContent).toContain('Test inspection notes');
  });

  it('should close the card (inspection version)', () => {
    mockViewModel.selectedInspectionDetails.set({ operation_id: '2', started_at: '2023-01-01T00:00:00Z', finished_at: null, notes: null, zone_name: 'Zone A', plants: [] });
    mockViewModel.selectedInspectionPlant.set({ plant_id: 'plant-uuid-123', latitude: 10, longitude: 20, occurrences: [] });
    fixture.detectChanges();

    component.close();
    expect(mockViewModel.selectedInspectionDetails()).toBeNull();
    expect(mockViewModel.selectedInspectionPlant()).toBeNull();
  });

  it('should format dates in pt-BR locale', () => {
    const result = component.formatDate('2023-06-15T14:30:00Z');
    expect(result).toContain('15');
    expect(result).toContain('06');
    expect(result).toContain('2023');
  });

  it('should render carousel controls and navigate when multiple inspections are present', () => {
    const navigateSpy = vi.spyOn(mockViewModel, 'navigateInspection');

    mockViewModel.selectedInspectionDetails.set({
      operation_id: '2',
      started_at: '2023-01-01T00:00:00Z',
      finished_at: '2023-01-01T01:00:00Z',
      notes: 'Test notes',
      zone_name: 'Zone A',
      plants: []
    });
    mockViewModel.selectedInspectionPlant.set({
      plant_id: 'plant-uuid-12345678',
      latitude: 10,
      longitude: 20,
      occurrences: []
    });
    mockViewModel.inspectionEntriesForPlant.set([
      { operation: { operation_id: '2', started_at: '2023-01-01T00:00:00Z', finished_at: '2023-01-01T01:00:00Z', notes: 'Notes', zone_name: 'Zone A', plants: [] }, plant: { plant_id: 'plant-uuid-12345678', latitude: 10, longitude: 20, occurrences: [] } },
      { operation: { operation_id: '3', started_at: '2023-01-02T00:00:00Z', finished_at: '2023-01-02T01:00:00Z', notes: null, zone_name: 'Zone A', plants: [] }, plant: { plant_id: 'plant-uuid-12345678', latitude: 10, longitude: 20, occurrences: [] } }
    ]);
    mockViewModel.currentInspectionIndex.set(0);

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Inspeções da Planta');
    expect(compiled.textContent).toContain('1 de 2');

    const buttons = compiled.querySelectorAll('button');
    const prevButton = buttons[1] as HTMLButtonElement;
    const nextButton = buttons[2] as HTMLButtonElement;

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);

    nextButton.click();
    expect(navigateSpy).toHaveBeenCalledWith('next');
  });

  it('should render annotation details when operation type is anotacao', () => {
    mockViewModel.selectedOperation.set('anotacao');
    mockViewModel.selectedInspectionDetails.set({
      operation_id: '2',
      started_at: '2023-01-01T00:00:00Z',
      finished_at: '2023-01-01T01:00:00Z',
      notes: 'Test annotation notes',
      zone_name: 'Zone A',
      plants: []
    });
    mockViewModel.selectedInspectionPlant.set({
      plant_id: 'plant-uuid-12345678',
      latitude: 10,
      longitude: 20,
      occurrences: [
        { occurrence_id: 'o1', occurrence_type_name: 'Praga A', status: 'open', severity: 'Média', notes: 'Na folha', resolved_at: null }
      ]
    });
    mockViewModel.inspectionEntriesForPlant.set([
      { operation: { operation_id: '2', started_at: '2023-01-01T00:00:00Z', finished_at: '2023-01-01T01:00:00Z', notes: 'Notes', zone_name: 'Zone A', plants: [] }, plant: { plant_id: 'plant-uuid-12345678', latitude: 10, longitude: 20, occurrences: [] } },
      { operation: { operation_id: '3', started_at: '2023-01-02T00:00:00Z', finished_at: '2023-01-02T01:00:00Z', notes: null, zone_name: 'Zone A', plants: [] }, plant: { plant_id: 'plant-uuid-12345678', latitude: 10, longitude: 20, occurrences: [] } }
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Anotação Manual');
    expect(compiled.textContent).toContain('Anotações da Planta');
    expect(compiled.textContent).toContain('Observações da Anotação');
  });
});

