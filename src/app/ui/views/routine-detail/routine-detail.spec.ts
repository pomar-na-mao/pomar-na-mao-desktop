import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RoutineDetail } from './routine-detail';
import { RoutinePlantDifference } from '../../components/routine-detail/routine-plant-difference/routine-plant-difference';
import { RoutineCurrentPlantMap } from '../../components/routine-detail/routine-current-plant-map/routine-current-plant-map';

@Component({
  selector: 'app-routine-plant-difference',
  standalone: true,
  template: '<div class="mock-routine-difference"></div>'
})
class MockRoutinePlantDifference {
  @Input() id!: number;
}

@Component({
  selector: 'app-routine-current-plant-map',
  standalone: true,
  template: '<div class="mock-routine-map"></div>'
})
class MockRoutineCurrentPlantMap {
  @Input() id!: number;
}

describe('RoutineDetail', () => {
  let fixture: ComponentFixture<RoutineDetail>;
  let component: RoutineDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutineDetail],
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
      .overrideComponent(RoutineDetail, {
        remove: { imports: [RoutinePlantDifference, RoutineCurrentPlantMap] },
        add: { imports: [MockRoutinePlantDifference, MockRoutineCurrentPlantMap] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(RoutineDetail);
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
    const plantDifference = fixture.debugElement.query(By.directive(MockRoutinePlantDifference));
    const map = fixture.debugElement.query(By.directive(MockRoutineCurrentPlantMap));

    expect(plantDifference).toBeTruthy();
    expect(map).toBeTruthy();
    expect(plantDifference.componentInstance.id).toBe(42);
    expect(map.componentInstance.id).toBe(42);
  });
});
