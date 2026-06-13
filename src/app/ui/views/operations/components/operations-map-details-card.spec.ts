import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationsMapDetailsCard } from './operations-map-details-card';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { signal } from '@angular/core';

describe('OperationsMapDetailsCard', () => {
  let component: OperationsMapDetailsCard;
  let fixture: ComponentFixture<OperationsMapDetailsCard>;
  let mockViewModel: any;

  beforeEach(async () => {
    mockViewModel = {
      selectedOperationDetails: signal(null)
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
      operator_name: 'John Doe',
      machine_name: 'Tractor 1',
      track_points_count: 50,
      inputs: [{ product_name: 'Fertilizer A', dose: 10, dose_unit: 'L' }]
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John Doe');
    expect(compiled.textContent).toContain('Tractor 1');
    expect(compiled.textContent).toContain('Fertilizer A');
  });

  it('should close the card', () => {
    mockViewModel.selectedOperationDetails.set({
      operator_name: 'John Doe',
      machine_name: 'Tractor 1',
      track_points_count: 50,
      inputs: []
    });
    fixture.detectChanges();

    component.close();
    expect(mockViewModel.selectedOperationDetails()).toBeNull();
  });
});
