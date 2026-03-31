import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectRoutinePlantDifference } from './inspect-routine-plant-difference';
import { InspectRoutineSyncViewModel } from '../../../view-models/inspect-routine/inspect-routine-sync.view-model';

describe('InspectRoutinePlantDifference', () => {
  let fixture: ComponentFixture<InspectRoutinePlantDifference>;
  let component: InspectRoutinePlantDifference;

  const mockInspectRoutineSyncViewModel = {
    initialize: vi.fn(),
    cleanup: vi.fn(),
    currentRoutineRegion: vi.fn(() => '01'),
    totalPlants: vi.fn(() => 2),
    currentInspectRoutinePlant: vi.fn(() => ({
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
    onApproveInspectRoutine: vi.fn(),
    goBack: vi.fn()
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [InspectRoutinePlantDifference, TranslateModule.forRoot()]
    })
      .overrideComponent(InspectRoutinePlantDifference, {
        set: {
          providers: [
            {
              provide: InspectRoutineSyncViewModel,
              useValue: mockInspectRoutineSyncViewModel
            }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(InspectRoutinePlantDifference);
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

    expect(mockInspectRoutineSyncViewModel.initialize).toHaveBeenCalledWith(10);
  });

  it('should cleanup the view model on destroy', () => {
    component.ngOnDestroy();

    expect(mockInspectRoutineSyncViewModel.cleanup).toHaveBeenCalled();
  });
});
