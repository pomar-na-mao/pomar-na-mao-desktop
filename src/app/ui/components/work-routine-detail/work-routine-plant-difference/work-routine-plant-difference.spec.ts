import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkRoutinePlantDifference } from './work-routine-plant-difference';
import { WorkRoutineSyncViewModel } from '../../../view-models/work-routine/work-routine-sync.view-model';

describe('WorkRoutinePlantDifference', () => {
  let fixture: ComponentFixture<WorkRoutinePlantDifference>;
  let component: WorkRoutinePlantDifference;

  const mockWorkRoutineSyncViewModel = {
    initialize: vi.fn(),
    cleanup: vi.fn(),
    currentRoutineRegion: vi.fn(() => '01'),
    totalPlants: vi.fn(() => 2),
    currentWorkRoutinePlant: vi.fn(() => ({
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
    onApproveWorkRoutine: vi.fn(),
    goBack: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [WorkRoutinePlantDifference, TranslateModule.forRoot()]
    })
      .overrideComponent(WorkRoutinePlantDifference, {
        set: {
          providers: [
            {
              provide: WorkRoutineSyncViewModel,
              useValue: mockWorkRoutineSyncViewModel
            }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkRoutinePlantDifference);
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

    expect(mockWorkRoutineSyncViewModel.initialize).toHaveBeenCalledWith(10);
  });

  it('should cleanup the view model on destroy', () => {
    component.ngOnDestroy();

    expect(mockWorkRoutineSyncViewModel.cleanup).toHaveBeenCalled();
  });
});
