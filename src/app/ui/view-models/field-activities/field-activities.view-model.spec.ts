import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { FieldActivitiesViewModel } from './field-activities.view-model';
import { FieldActivitiesRepository } from '../../../data/repositories/field-activities/field-activities.repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';

describe('FieldActivitiesViewModel', () => {
  let viewModel: FieldActivitiesViewModel;
  let repository: FieldActivitiesRepository;
  const mockMessageService = { add: vi.fn() };
  const mockFarmBoundaryService = { getBoundary: vi.fn().mockResolvedValue([]) };

  const sampleActivities: FieldActivityItem[] = [
    {
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
    },
    {
      id: 'act-2',
      field_operation_id: 'op-2',
      activity: 'Pulverização foliar',
      responsible: 'João Santos',
      performed_at: '2026-10-28T18:00:00.000Z',
      geometry_type: 'area',
      geometry_geojson: {
        type: 'Polygon',
        coordinates: [[[-47.8, -21.1], [-47.81, -21.1], [-47.81, -21.11], [-47.8, -21.1]]],
      },
      mixture_id: 'mix-1',
      mixture_name: 'Calda bordolesa 1%',
      device_id: 'dev-2',
      local_id: 'loc-2',
      created_at: '2026-10-29T01:08:14.000Z',
      updated_at: '2026-10-29T01:08:14.000Z',
      inputs: [
        {
          id: 'inp-1',
          input_id: 'i-1',
          name: 'Sulfato de Cobre',
          active_ingredient: 'Cobre',
          label_dose: '100g',
          dose_unit: 'g/100L',
          applied_dose: '100g',
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        FieldActivitiesViewModel,
        FieldActivitiesRepository,
        { provide: MessageService, useValue: mockMessageService },
        { provide: FarmBoundaryService, useValue: mockFarmBoundaryService },
      ],
    });

    viewModel = TestBed.inject(FieldActivitiesViewModel);
    repository = TestBed.inject(FieldActivitiesRepository);
  });

  it('should calculate KPIs correctly', () => {
    repository.activities.set(sampleActivities);

    expect(viewModel.totalCount()).toBe(2);
    expect(viewModel.routeCount()).toBe(1);
    expect(viewModel.areaCount()).toBe(1);
    expect(viewModel.withMixtureCount()).toBe(1);
  });

  it('should filter activities by geometry type', () => {
    repository.activities.set(sampleActivities);

    viewModel.selectedGeometryType.set('route');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-1');

    viewModel.selectedGeometryType.set('area');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-2');

    viewModel.selectedGeometryType.set('all');
    expect(viewModel.filteredActivities().length).toBe(2);
  });

  it('should filter activities by search query in activity, responsible, mixture and inputs', () => {
    repository.activities.set(sampleActivities);

    viewModel.globalFilter.set('roçagem');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-1');

    viewModel.globalFilter.set('joão');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-2');

    viewModel.globalFilter.set('bordolesa');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-2');

    viewModel.globalFilter.set('cobre');
    expect(viewModel.filteredActivities().length).toBe(1);
    expect(viewModel.filteredActivities()[0].id).toBe('act-2');

    viewModel.globalFilter.set('inexistente');
    expect(viewModel.filteredActivities().length).toBe(0);
  });

  it('should detect active filters correctly', () => {
    expect(viewModel.hasActiveFilters()).toBe(false);

    viewModel.globalFilter.set('poda');
    expect(viewModel.hasActiveFilters()).toBe(true);

    viewModel.globalFilter.set('');
    expect(viewModel.hasActiveFilters()).toBe(false);

    viewModel.selectedGeometryType.set('route');
    expect(viewModel.hasActiveFilters()).toBe(true);

    viewModel.selectedGeometryType.set('all');
    expect(viewModel.hasActiveFilters()).toBe(false);

    viewModel.startDate.set('2026-10-01');
    expect(viewModel.hasActiveFilters()).toBe(true);

    viewModel.clearFilters();
    expect(viewModel.hasActiveFilters()).toBe(false);
  });

  it('should manage details dialog state and badge styles', () => {
    const routeStyle = viewModel.geometryBadgeStyle('route');
    expect(routeStyle.label).toBe('Rota');
    expect(routeStyle.icon).toContain('directions');

    const areaStyle = viewModel.geometryBadgeStyle('area');
    expect(areaStyle.label).toBe('Área');
    expect(areaStyle.icon).toContain('map');

    viewModel.openDetails(sampleActivities[0]);
    expect(viewModel.detailsDialogVisible()).toBe(true);
    expect(viewModel.selectedActivity()).toEqual(sampleActivities[0]);

    viewModel.closeDetails();
    expect(viewModel.detailsDialogVisible()).toBe(false);
    expect(viewModel.selectedActivity()).toBeNull();
  });

  it('should load initial data and handle errors gracefully', async () => {
    vi.spyOn(repository, 'findAll').mockResolvedValue({ error: null });

    await viewModel.loadInitialData();
    expect(repository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);
  });
});
