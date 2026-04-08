import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FarmOverviewMap } from './farm-overview-map';
import { FarmOverviewMapViewModel } from '../../../view-models/farm-overview-map/farm-overview-map.view-model';
import { RegionsRepository } from '../../../../data/repositories/regions/regions-repository';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi, type Mock, type MockInstance } from 'vitest';
import { By } from '@angular/platform-browser';
import type { Region } from '../../../../domain/models/regions.model';

type FarmOverviewMapPrivateApi = {
  initMap: () => void;
  renderPolygons: () => void;
  fitAllRegions: () => void;
};

describe('FarmOverviewMap', () => {
  let component: FarmOverviewMap;
  let fixture: ComponentFixture<FarmOverviewMap>;
  let mockFarmOverviewMapViewModel: Partial<FarmOverviewMapViewModel>;
  let mockRegionsRepository: Partial<RegionsRepository>;
  let initMapSpy: MockInstance<() => void>;

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
    const componentPrototype = Object.getPrototypeOf(component) as FarmOverviewMapPrivateApi;
    initMapSpy = vi.spyOn(componentPrototype, 'initMap').mockImplementation(() => undefined);
    vi.spyOn(componentPrototype, 'renderPolygons').mockImplementation(() => undefined);
    vi.spyOn(componentPrototype, 'fitAllRegions').mockImplementation(() => undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map on afterViewInit', () => {
    component.ngAfterViewInit();
    expect(initMapSpy).toHaveBeenCalled();
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
