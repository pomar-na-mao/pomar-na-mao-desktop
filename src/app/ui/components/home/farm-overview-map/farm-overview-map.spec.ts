import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmOverviewMap } from './farm-overview-map';
import { FarmOverviewMapViewModel } from '../../../view-models/farm-overview-map/farm-overview-map.view-model';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { By } from '@angular/platform-browser';
import * as L from 'leaflet';

// Mock Leaflet
vi.mock('leaflet', () => ({
  map: vi.fn().mockReturnValue({
    setView: vi.fn(),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
    addControl: vi.fn(),
    on: vi.fn(),
    fitBounds: vi.fn(),
    fitWorld: vi.fn()
  }),
  tileLayer: vi.fn().mockReturnValue({
    addTo: vi.fn()
  }),
  marker: vi.fn().mockReturnValue({
    addTo: vi.fn(),
    setLatLng: vi.fn()
  }),
  polygon: vi.fn().mockReturnValue({
    addTo: vi.fn(),
    remove: vi.fn(),
    bindTooltip: vi.fn()
  }),
  circle: vi.fn().mockReturnValue({
    addTo: vi.fn(),
    remove: vi.fn()
  }),
  icon: vi.fn().mockReturnValue({}),
  divIcon: vi.fn().mockReturnValue({}),
  LatLng: vi.fn(),
  featureGroup: vi.fn().mockReturnValue({
    getBounds: vi.fn()
  }),
  Marker: {
    prototype: {
      options: {
        icon: {}
      }
    }
  }
}));

describe('FarmOverviewMap', () => {
  let component: FarmOverviewMap;
  let fixture: ComponentFixture<FarmOverviewMap>;
  let mockFarmOverviewMapViewModel: any;

  beforeEach(async () => {
    mockFarmOverviewMapViewModel = {
      selectedRegionId: signal(''),
      selectedOccurrenceKey: signal(''),
      selectedVariety: signal(''),
      isLoadingRegions: signal(false),
      plants: signal([]),
      regionsGroupedByName: signal(new Map()),
      uniqueRegions: signal([]),
      regionOptions: signal([]),
      occurrenceOptions: signal([]),
      varietyOptions: signal([]),
      loadRegions: vi.fn().mockResolvedValue(undefined),
      findRegionById: vi.fn().mockReturnValue(undefined),
      onRegionChange: vi.fn(),
      onOccurrenceChange: vi.fn(),
      onVarietyChange: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FarmOverviewMap, TranslateModule.forRoot()],
    })
    .overrideComponent(FarmOverviewMap, {
      set: {
        providers: [
          { provide: FarmOverviewMapViewModel, useValue: mockFarmOverviewMapViewModel }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmOverviewMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on afterViewInit', () => {
    component.ngAfterViewInit();
    expect(L.map).toHaveBeenCalled();
  });

  it('should call loadRegions on ngOnInit', async () => {
    await component.ngOnInit();
    expect(mockFarmOverviewMapViewModel.loadRegions).toHaveBeenCalled();
  });

  it('should render map container', () => {
    const mapContainer = fixture.debugElement.query(By.css('#map'));
    expect(mapContainer).toBeTruthy();
  });
});
