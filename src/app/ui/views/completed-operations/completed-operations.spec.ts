import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CompletedOperations } from './completed-operations';
import { FieldActivitiesViewModel } from '../../view-models/field-activities/field-activities.view-model';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';

describe('CompletedOperations Component', () => {
  let mockViewModel: Partial<FieldActivitiesViewModel>;

  const sampleActivity: FieldActivityItem = {
    id: 'act-1',
    field_operation_id: 'op-1',
    activity: 'Roçagem de pomar',
    responsible: 'Lucas Silveira',
    performed_at: '2026-10-28T23:38:00.000Z',
    geometry_type: 'route',
    geometry_geojson: { type: 'LineString', coordinates: [[-47.79, -21.23], [-47.791, -21.235]] },
    mixture_id: null,
    mixture_name: null,
    device_id: 'dev-1',
    local_id: 'loc-1',
    created_at: '2026-10-28T23:38:33.000Z',
    updated_at: '2026-10-28T23:38:33.000Z',
    inputs: [],
  };

  beforeEach(() => {
    mockViewModel = {
      activities: signal([sampleActivity]),
      filteredActivities: signal([sampleActivity]),
      isLoading: signal(false),
      loadFailed: signal(false),
      globalFilter: signal(''),
      selectedGeometryType: signal<'all' | 'route' | 'area'>('all'),
      startDate: signal(''),
      endDate: signal(''),
      viewMode: signal<'table' | 'map'>('table'),
      selectedActivity: signal<FieldActivityItem | null>(null),
      detailsDialogVisible: signal(false),
      isMapFullscreen: signal(false),
      totalCount: signal(1),
      routeCount: signal(1),
      areaCount: signal(0),
      withMixtureCount: signal(0),
      hasActiveFilters: signal(false),
      loadInitialData: vi.fn().mockResolvedValue(undefined),
      filterByDates: vi.fn().mockResolvedValue(undefined),
      clearFilters: vi.fn(),
      openDetails: vi.fn(),
      closeDetails: vi.fn(),
      geometryBadgeStyle: vi.fn().mockReturnValue({
        label: 'Rota',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        icon: 'pi pi-directions',
      }),
      initMap: vi.fn(),
      invalidateMapSize: vi.fn(),
      destroyMap: vi.fn(),
      initMiniMap: vi.fn(),
      destroyMiniMap: vi.fn(),
      focusActivityOnMap: vi.fn(),
      toggleFullscreen: vi.fn(),
    };
  });

  it('should initialize and load activities data', async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedOperations],
    })
      .overrideComponent(CompletedOperations, {
        set: {
          providers: [{ provide: FieldActivitiesViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CompletedOperations);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(mockViewModel.loadInitialData).toHaveBeenCalled();
  });

  it('should switch view mode between table and map', async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedOperations],
    })
      .overrideComponent(CompletedOperations, {
        set: {
          providers: [{ provide: FieldActivitiesViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CompletedOperations);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.setViewMode('map');
    expect(mockViewModel.viewMode?.()).toBe('map');

    component.setViewMode('table');
    expect(mockViewModel.viewMode?.()).toBe('table');
  });

  it('should initialize mini-map when details dialog is shown', async () => {
    (mockViewModel.selectedActivity as ReturnType<typeof signal<FieldActivityItem | null>>).set(
      sampleActivity,
    );

    await TestBed.configureTestingModule({
      imports: [CompletedOperations],
    })
      .overrideComponent(CompletedOperations, {
        set: {
          providers: [{ provide: FieldActivitiesViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CompletedOperations);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onDetailsShown();
    expect(mockViewModel.initMiniMap).toHaveBeenCalledWith('activity-mini-map', sampleActivity);
  });

  it('should render map containers with dark mode filter classes', async () => {
    (mockViewModel.viewMode as ReturnType<typeof signal<'table' | 'map'>>).set('map');
    (mockViewModel.selectedActivity as ReturnType<typeof signal<FieldActivityItem | null>>).set(
      sampleActivity,
    );
    (mockViewModel.detailsDialogVisible as ReturnType<typeof signal<boolean>>).set(true);

    await TestBed.configureTestingModule({
      imports: [CompletedOperations],
    })
      .overrideComponent(CompletedOperations, {
        set: {
          providers: [{ provide: FieldActivitiesViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CompletedOperations);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const mainMap = compiled.querySelector('#activities-main-map');
    expect(mainMap).toBeTruthy();
    expect(mainMap?.className).toContain('dark:[filter:invert');
  });

  it('should clean up maps on destroy', async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedOperations],
    })
      .overrideComponent(CompletedOperations, {
        set: {
          providers: [{ provide: FieldActivitiesViewModel, useValue: mockViewModel }],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(CompletedOperations);
    fixture.detectChanges();

    fixture.destroy();
    expect(mockViewModel.destroyMap).toHaveBeenCalled();
    expect(mockViewModel.destroyMiniMap).toHaveBeenCalled();
  });
});
