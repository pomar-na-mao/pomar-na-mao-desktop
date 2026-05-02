import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { AnnotationDetail } from './annotation-detail';
import { AnnotationOccurrences } from '../../components/annotation-detail/annotation-occurrences/annotation-occurrences';
import { AnnotationCurrentPointMap } from '../../components/annotation-detail/annotation-current-point-map/annotation-current-point-map';

@Component({
  selector: 'app-annotation-occurrences',
  standalone: true,
  template: '<div class="mock-annotation-occurrences"></div>'
})
class MockAnnotationOccurrences {
  @Input() id!: string;
}

@Component({
  selector: 'app-annotation-current-point-map',
  standalone: true,
  template: '<div class="mock-annotation-map"></div>'
})
class MockAnnotationCurrentPointMap {
  @Input() id!: string;
}

describe('AnnotationDetail', () => {
  let fixture: ComponentFixture<AnnotationDetail>;
  let component: AnnotationDetail;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationDetail],
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
      .overrideComponent(AnnotationDetail, {
        remove: { imports: [AnnotationOccurrences, AnnotationCurrentPointMap] },
        add: { imports: [MockAnnotationOccurrences, MockAnnotationCurrentPointMap] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(AnnotationDetail);
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
    const occurrences = fixture.debugElement.query(By.directive(MockAnnotationOccurrences));
    const map = fixture.debugElement.query(By.directive(MockAnnotationCurrentPointMap));

    expect(occurrences).toBeTruthy();
    expect(map).toBeTruthy();
    expect(occurrences.componentInstance.id).toBe('annotation-123');
    expect(map.componentInstance.id).toBe('annotation-123');
  });
});
