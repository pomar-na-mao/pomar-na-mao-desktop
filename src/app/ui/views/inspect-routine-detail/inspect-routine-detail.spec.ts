import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { InspectRoutineDetail } from './inspect-routine-detail';
import { InspectRoutinePlantDifference } from '../../components/inspect-routine-detail/inspect-routine-plant-difference/inspect-routine-plant-difference';
import { InspectRoutineCurrentPlantMap } from '../../components/inspect-routine-detail/inspect-routine-current-plant-map/inspect-routine-current-plant-map';

@Component({
  selector: 'app-inspect-routine-plant-difference',
  standalone: true,
  template: '<div class="mock-routine-difference"></div>'
})
class MockInspectRoutinePlantDifference {
  @Input() id!: number;
}

@Component({
  selector: 'app-inspect-routine-current-plant-map',
  standalone: true,
  template: '<div class="mock-routine-map"></div>'
})
class MockInspectRoutineCurrentPlantMap {
  @Input() id!: number;
}

describe('InspectRoutineDetail', () => {
  let fixture: ComponentFixture<InspectRoutineDetail>;
  let component: InspectRoutineDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectRoutineDetail],
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
      .overrideComponent(InspectRoutineDetail, {
        remove: { imports: [InspectRoutinePlantDifference, InspectRoutineCurrentPlantMap] },
        add: { imports: [MockInspectRoutinePlantDifference, MockInspectRoutineCurrentPlantMap] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(InspectRoutineDetail);
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
    const plantDifference = fixture.debugElement.query(By.directive(MockInspectRoutinePlantDifference));
    const map = fixture.debugElement.query(By.directive(MockInspectRoutineCurrentPlantMap));

    expect(plantDifference).toBeTruthy();
    expect(map).toBeTruthy();
    expect(plantDifference.componentInstance.id).toBe(42);
    expect(map.componentInstance.id).toBe(42);
  });
});
