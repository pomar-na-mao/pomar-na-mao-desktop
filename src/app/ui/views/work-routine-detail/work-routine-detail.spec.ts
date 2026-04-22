import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { WorkRoutineDetail } from './work-routine-detail';
import { WorkRoutinePlantDifference } from '../../components/work-routine-detail/work-routine-plant-difference/work-routine-plant-difference';
import { WorkRoutineCurrentPlantMap } from '../../components/work-routine-detail/work-routine-current-plant-map/work-routine-current-plant-map';

@Component({
  selector: 'app-work-routine-plant-difference',
  standalone: true,
  template: '<div class="mock-routine-difference"></div>'
})
class MockWorkRoutinePlantDifference {
  @Input() id!: number;
}

@Component({
  selector: 'app-work-routine-current-plant-map',
  standalone: true,
  template: '<div class="mock-routine-map"></div>'
})
class MockWorkRoutineCurrentPlantMap {
  @Input() id!: number;
}

describe('WorkRoutineDetail', () => {
  let fixture: ComponentFixture<WorkRoutineDetail>;
  let component: WorkRoutineDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkRoutineDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '42' })
            }
          }
        }
      ]
    })
      .overrideComponent(WorkRoutineDetail, {
        remove: { imports: [WorkRoutinePlantDifference, WorkRoutineCurrentPlantMap] },
        add: { imports: [MockWorkRoutinePlantDifference, MockWorkRoutineCurrentPlantMap] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkRoutineDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read and parse the id from the route', () => {
    expect(component.id).toBe(42);
  });

  it('should pass the parsed id to the child components', () => {
    const plantDifference = fixture.debugElement.query(By.directive(MockWorkRoutinePlantDifference));
    const map = fixture.debugElement.query(By.directive(MockWorkRoutineCurrentPlantMap));

    expect(plantDifference).toBeTruthy();
    expect(map).toBeTruthy();
    expect(plantDifference.componentInstance.id).toBe(42);
    expect(map.componentInstance.id).toBe(42);
  });
});
