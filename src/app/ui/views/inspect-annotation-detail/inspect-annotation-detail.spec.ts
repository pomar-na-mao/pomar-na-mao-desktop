import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { InspectAnnotationDetail } from './inspect-annotation-detail';
import { InspectAnnotationOccurrences } from '../../components/inspect-annotation-detail/inspect-annotation-occurrences/inspect-annotation-occurrences';
import { InspectAnnotationCurrentPointMap } from '../../components/inspect-annotation-detail/inspect-annotation-current-point-map/inspect-annotation-current-point-map';

@Component({
  selector: 'app-inspect-annotation-occurrences',
  standalone: true,
  template: '<div class="mock-annotation-occurrences"></div>'
})
class MockInspectAnnotationOccurrences {
  @Input() id!: string;
}

@Component({
  selector: 'app-inspect-annotation-current-point-map',
  standalone: true,
  template: '<div class="mock-annotation-map"></div>'
})
class MockInspectAnnotationCurrentPointMap {
  @Input() id!: string;
}

describe('InspectAnnotationDetail', () => {
  let fixture: ComponentFixture<InspectAnnotationDetail>;
  let component: InspectAnnotationDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectAnnotationDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'annotation-123' })
            }
          }
        }
      ]
    })
      .overrideComponent(InspectAnnotationDetail, {
        remove: { imports: [InspectAnnotationOccurrences, InspectAnnotationCurrentPointMap] },
        add: { imports: [MockInspectAnnotationOccurrences, MockInspectAnnotationCurrentPointMap] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(InspectAnnotationDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read the id from the route', () => {
    expect(component.id).toBe('annotation-123');
  });

  it('should pass the route id to the child components', () => {
    const occurrences = fixture.debugElement.query(By.directive(MockInspectAnnotationOccurrences));
    const map = fixture.debugElement.query(By.directive(MockInspectAnnotationCurrentPointMap));

    expect(occurrences).toBeTruthy();
    expect(map).toBeTruthy();
    expect(occurrences.componentInstance.id).toBe('annotation-123');
    expect(map.componentInstance.id).toBe('annotation-123');
  });
});
