import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmOverviewMap } from './farm-overview-map';
import { FarmOverviewMapViewModel } from '../../../view-models/farm-overview-map/farm-overview-map.view-model';
import { RegionsRepository } from '../../../../data/repositories/regions/regions-repository';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { By } from '@angular/platform-browser';
import * as L from 'leaflet';
import type { Region } from '../../../../domain/models/regions.model';

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
  let mockFarmOverviewMapViewModel: Partial<FarmOverviewMapViewModel>;
  let mockRegionsRepository: Partial<RegionsRepository>;

  beforeEach(async () => {
    mockFarmOverviewMapViewModel = {
      isLoadingRegions: signal(false),
      regionsGroupedByName: signal(new Map()),
      uniqueRegions: signal([]),
      regionOptions: signal([]),
      occurrenceOptions: signal([]),
      varietyOptions: signal([]),
      plants: signal([]),
      loadRegions: vi.fn().mockResolvedValue(undefined),
      loadPlants: vi.fn().mockResolvedValue(undefined),
      findRegionById: vi.fn().mockReturnValue(undefined)
    };

    mockRegionsRepository = {
      currentRegion: signal(null)
    };

    await TestBed.configureTestingModule({
      imports: [FarmOverviewMap, TranslateModule.forRoot()],
    })
      .overrideComponent(FarmOverviewMap, {
        set: {
          providers: [
            { provide: FarmOverviewMapViewModel, useValue: mockFarmOverviewMapViewModel },
            { provide: RegionsRepository, useValue: mockRegionsRepository }
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
    expect(mockFarmOverviewMapViewModel.loadRegions!).toHaveBeenCalled();
  });

  it('should update local signals and repository on region change', () => {
    const regionId = 'r1';
    const mockRegion: Region = { id: 'r1', region: 'North', created_at: '', longitude: 0, latitude: 0 };
    (mockFarmOverviewMapViewModel.findRegionById as Mock).mockReturnValue(mockRegion);

    component.onRegionChange(regionId);

    expect(component.selectedRegionId()).toBe(regionId);
    expect(mockRegionsRepository.currentRegion!()).toEqual(mockRegion);
  });

  it('should render map container', () => {
    const mapContainer = fixture.debugElement.query(By.css('#map'));
    expect(mapContainer).toBeTruthy();
  });
});
