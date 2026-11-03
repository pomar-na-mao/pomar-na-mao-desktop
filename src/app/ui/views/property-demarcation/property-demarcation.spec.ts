import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolygonSelection } from '../../../domain/models/basic-data';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { MessageService } from '../../../data/services/message/message.service';
import { MapPolygonSelector } from '../../components/basic-data/map-polygon-selector/map-polygon-selector';
import { PropertyDemarcation } from './property-demarcation';

@Component({
  selector: 'app-map-polygon-selector',
  standalone: true,
  template: '<div data-testid="property-map"></div>',
})
class MockMapPolygonSelector {
  readonly center = input<[number, number]>();
  readonly zoom = input<number>();
  readonly plants = input<unknown[]>();
  readonly allowDrawingWithoutPlants = input<boolean>();
  readonly maxPolygons = input<number>();
  readonly backgroundPolygon = input<[number, number][] | null>();
  readonly focusedPolygon = input<[number, number][] | null>();
  readonly backgroundPolygonColor = input<string>();
  readonly backgroundPolygonDashArray = input<string | null>();
  readonly backgroundPolygonFillOpacity = input<number>();
  readonly clearSignal = input<number>();
  readonly polygonSelected = output<PolygonSelection>();
  readonly polygonCleared = output<void>();
}

describe('PropertyDemarcation', () => {
  const farmBoundaryService = {
    getBoundary: vi.fn(),
    replaceBoundary: vi.fn(),
  };
  const messageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    farmBoundaryService.getBoundary.mockResolvedValue([]);
    farmBoundaryService.replaceBoundary.mockResolvedValue(3);
    await TestBed.configureTestingModule({
      imports: [PropertyDemarcation],
      providers: [
        { provide: FarmBoundaryService, useValue: farmBoundaryService },
        { provide: MessageService, useValue: messageService },
      ],
    })
      .overrideComponent(PropertyDemarcation, {
        remove: { imports: [MapPolygonSelector] },
        add: { imports: [MockMapPolygonSelector] },
      })
      .compileComponents();
  });

  it('should render coordinate controls and disable save without a candidate', async () => {
    const fixture = TestBed.createComponent(PropertyDemarcation);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#property-latitude')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#property-longitude')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[data-testid="property-map"]')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector(
        'p-button[aria-label="Salvar demarcação"]',
      ),
    ).toBeTruthy();
    expect(fixture.componentInstance.viewModel.canSave()).toBe(false);
  });

  it('should show validation feedback for invalid focus coordinates', () => {
    const fixture = TestBed.createComponent(PropertyDemarcation);
    fixture.detectChanges();
    fixture.componentInstance.viewModel.coordinateForm.setValue({
      latitude: '91',
      longitude: '-49',
    });

    fixture.componentInstance.viewModel.focusCoordinates();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'latitude',
    );
  });

  it('should retain the candidate in the screen state after a save failure', async () => {
    const fixture = TestBed.createComponent(PropertyDemarcation);
    fixture.detectChanges();
    fixture.componentInstance.viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
      { lat: -23.3, lng: -49.3 },
    ]);
    farmBoundaryService.replaceBoundary.mockRejectedValue(new Error('failed'));

    await fixture.componentInstance.viewModel.saveBoundary();

    expect(fixture.componentInstance.viewModel.candidateBoundary()).toHaveLength(3);
  });
});
