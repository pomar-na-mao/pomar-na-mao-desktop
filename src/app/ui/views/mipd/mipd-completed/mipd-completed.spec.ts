import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MipdOperationItem } from '../../../../domain/models/mipd-operation.model';
import { MipdCompletedViewModel } from '../../../view-models/mipd/mipd-completed.view-model';
import { MipdCompleted } from './mipd-completed';

describe('MipdCompleted Component', () => {
  let mockViewModel: Partial<MipdCompletedViewModel>;

  const sampleItem: MipdOperationItem = {
    operation_id: 'op-1',
    marking_id: 'm-1',
    started_at: '2026-11-12T10:00:00Z',
    observed_at: '2026-11-12T09:00:00Z',
    plant_id: 'plant-12345678',
    latitude: -23.403,
    longitude: -49.149,
    zone_name: 'Talhão 1',
    occurrence_type_id: 'occ-1',
    occurrence_type_name: 'Cancro Cítrico',
    plant_parts: ['LEAF', 'BRANCH'],
    photo_object_path: 'user/dev/photo.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockViewModel = {
      operations: signal([sampleItem]),
      filteredOperations: signal([sampleItem]),
      zones: signal([{ id: 'z1', name: 'Talhão 1' }]) as unknown as MipdCompletedViewModel['zones'],
      occurrenceTypes: signal([{ id: 'occ-1', name: 'Cancro Cítrico' }]) as unknown as MipdCompletedViewModel['occurrenceTypes'],
      isLoading: signal(false),
      loadFailed: signal(false),
      globalFilter: signal(''),
      selectedZoneId: signal(''),
      selectedOccurrenceTypeId: signal(''),
      startDate: signal(''),
      endDate: signal(''),
      viewMode: signal<'table' | 'map'>('table'),
      selectedItem: signal<MipdOperationItem | null>(null),
      detailsDialogVisible: signal(false),
      isMapFullscreen: signal(false),
      totalCount: signal(1),
      withPhotoCount: signal(1),
      uniquePlantsCount: signal(1),
      hasActiveFilters: signal(false),
      photoUrl: signal(null),
      photoLoading: signal(false),
      photoError: signal(null),
      loadInitialData: vi.fn().mockResolvedValue(undefined),
      fetchData: vi.fn().mockResolvedValue(undefined),
      clearFilters: vi.fn(),
      openDetails: vi.fn().mockResolvedValue(undefined),
      closeDetails: vi.fn(),
      initMap: vi.fn(),
      destroyMap: vi.fn(),
      invalidateMapSize: vi.fn(),
      initMiniMap: vi.fn(),
      destroyMiniMap: vi.fn(),
      zoomToFarm: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [MipdCompleted],
      providers: [MessageService],
    });

    TestBed.overrideComponent(MipdCompleted, {
      set: {
        providers: [
          { provide: MipdCompletedViewModel, useValue: mockViewModel },
          MessageService,
        ],
      },
    });
  });

  it('creates component and triggers loadInitialData on init', () => {
    const fixture = TestBed.createComponent(MipdCompleted);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(mockViewModel.loadInitialData).toHaveBeenCalled();
  });

  it('switches view mode between table and map', () => {
    const fixture = TestBed.createComponent(MipdCompleted);
    const comp = fixture.componentInstance;

    comp.setViewMode('map');
    expect(mockViewModel.viewMode?.()).toBe('map');

    comp.setViewMode('table');
    expect(mockViewModel.viewMode?.()).toBe('table');
  });

  it('updates zone and occurrence type filters', () => {
    const fixture = TestBed.createComponent(MipdCompleted);
    const comp = fixture.componentInstance;

    comp.onZoneFilterChange('Talhão 1');
    expect(mockViewModel.selectedZoneId?.()).toBe('Talhão 1');

    comp.onOccurrenceTypeFilterChange('occ-1');
    expect(mockViewModel.selectedOccurrenceTypeId?.()).toBe('occ-1');
  });

  it('triggers mini-map initialization when details are shown', () => {
    const fixture = TestBed.createComponent(MipdCompleted);
    const comp = fixture.componentInstance;

    mockViewModel.selectedItem.set(sampleItem);
    comp.onDetailsShown();

    expect(mockViewModel.initMiniMap).toHaveBeenCalledWith('mipd-mini-map', sampleItem);
  });

  it('cleans up maps on destroy', () => {
    const fixture = TestBed.createComponent(MipdCompleted);
    const comp = fixture.componentInstance;

    comp.ngOnDestroy();
    expect(mockViewModel.destroyMap).toHaveBeenCalled();
    expect(mockViewModel.destroyMiniMap).toHaveBeenCalled();
  });
});
