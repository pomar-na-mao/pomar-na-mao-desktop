import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutinePlantDifference } from './routine-plant-difference';
import { RoutineSyncViewModel } from '../../../view-models/routine/routine-sync.view-model';

describe('RoutinePlantDifference', () => {
  let fixture: ComponentFixture<RoutinePlantDifference>;
  let component: RoutinePlantDifference;

  const mockRoutineSyncViewModel = {
    initialize: vi.fn(),
    cleanup: vi.fn(),
    currentRoutineRegion: vi.fn(() => '01'),
    totalPlants: vi.fn(() => 2),
    currentRoutinePlant: vi.fn(() => ({
      plant_id: '123-ABC',
      is_approved: false
    })),
    isPlantLoading: vi.fn(() => false),
    occurrencesChanges: vi.fn(() => ({
      exclusions: [],
      inclusions: ['aphid']
    })),
    occurrencesLabels: {
      aphid: 'COMMON.APHiD'
    },
    currentPlantIndex: vi.fn(() => 0),
    previousPlant: vi.fn(),
    nextPlant: vi.fn(),
    isApproving: vi.fn(() => false),
    onApproveRoutine: vi.fn(),
    goBack: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [RoutinePlantDifference]
    })
      .overrideComponent(RoutinePlantDifference, {
        set: {
          providers: [
            {
              provide: RoutineSyncViewModel,
              useValue: mockRoutineSyncViewModel
            }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoutinePlantDifference);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the view model when the id changes', () => {
    component.id = 10;

    component.ngOnChanges({
      id: {
        currentValue: 10,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(mockRoutineSyncViewModel.initialize).toHaveBeenCalledWith(10);
  });

  it('should cleanup the view model on destroy', () => {
    component.ngOnDestroy();

    expect(mockRoutineSyncViewModel.cleanup).toHaveBeenCalled();
  });
});
