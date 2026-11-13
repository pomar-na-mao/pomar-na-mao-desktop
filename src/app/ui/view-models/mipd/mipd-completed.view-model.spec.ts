import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MipdRepository } from '../../../data/repositories/mipd/mipd.repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { MipdOperationItem } from '../../../domain/models/mipd-operation.model';
import { MipdCompletedViewModel } from './mipd-completed.view-model';

describe('MipdCompletedViewModel', () => {
  let viewModel: MipdCompletedViewModel;
  const mockFindAll = vi.fn();
  const mockLoadZones = vi.fn();
  const mockLoadOccurrenceTypes = vi.fn();
  const mockGetSignedPhotoUrl = vi.fn();
  const mockGetBoundary = vi.fn();
  const mockMessageAdd = vi.fn();

  const sampleItems: MipdOperationItem[] = [
    {
      operation_id: 'op-1',
      marking_id: 'm-1',
      started_at: '2026-11-12T10:00:00Z',
      observed_at: '2026-11-12T09:00:00Z',
      plant_id: 'plant-1',
      latitude: -23.403,
      longitude: -49.149,
      zone_name: 'Talhão A',
      occurrence_type_id: 'occ-1',
      occurrence_type_name: 'Cancro Cítrico',
      plant_parts: ['LEAF'],
      photo_object_path: 'user/dev/photo1.jpg',
    },
    {
      operation_id: 'op-2',
      marking_id: 'm-2',
      started_at: '2026-11-12T11:00:00Z',
      observed_at: '2026-11-12T10:30:00Z',
      plant_id: 'plant-2',
      latitude: -23.404,
      longitude: -49.15,
      zone_name: 'Talhão B',
      occurrence_type_id: 'occ-2',
      occurrence_type_name: 'Greening',
      plant_parts: ['BRANCH', 'FRUIT'],
      photo_object_path: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MipdCompletedViewModel,
        {
          provide: MipdRepository,
          useValue: {
            operations: signal(sampleItems),
            zones: signal([
              { id: 'Talhão A', name: 'Talhão A' },
              { id: 'Talhão B', name: 'Talhão B' },
            ]),
            occurrenceTypes: signal([
              { id: 'occ-1', name: 'Cancro Cítrico' },
              { id: 'occ-2', name: 'Greening' },
            ]),
            findAll: mockFindAll.mockResolvedValue({ error: null }),
            loadZones: mockLoadZones.mockResolvedValue(undefined),
            loadOccurrenceTypes: mockLoadOccurrenceTypes.mockResolvedValue(undefined),
            getSignedPhotoUrl: mockGetSignedPhotoUrl,
          },
        },
        {
          provide: FarmBoundaryService,
          useValue: {
            getBoundary: mockGetBoundary.mockResolvedValue([]),
          },
        },
        {
          provide: MessageService,
          useValue: {
            add: mockMessageAdd,
          },
        },
      ],
    });

    viewModel = TestBed.inject(MipdCompletedViewModel);
  });

  it('computes counts correctly', () => {
    expect(viewModel.totalCount()).toBe(2);
    expect(viewModel.withPhotoCount()).toBe(1);
    expect(viewModel.uniquePlantsCount()).toBe(2);
  });

  it('filters operations by global query', () => {
    viewModel.globalFilter.set('Greening');
    expect(viewModel.filteredOperations().length).toBe(1);
    expect(viewModel.filteredOperations()[0].occurrence_type_name).toBe('Greening');

    viewModel.globalFilter.set('Talhão A');
    expect(viewModel.filteredOperations().length).toBe(1);
    expect(viewModel.filteredOperations()[0].zone_name).toBe('Talhão A');
  });

  it('filters operations by occurrence type and zone', () => {
    viewModel.selectedOccurrenceTypeId.set('occ-1');
    expect(viewModel.filteredOperations().length).toBe(1);
    expect(viewModel.filteredOperations()[0].occurrence_type_id).toBe('occ-1');

    viewModel.selectedZoneId.set('Talhão B');
    expect(viewModel.filteredOperations().length).toBe(0);
  });

  it('opens details dialog and fetches signed photo url if present', async () => {
    mockGetSignedPhotoUrl.mockResolvedValueOnce('https://signed-url.com/photo.jpg');

    await viewModel.openDetails(sampleItems[0]);

    expect(viewModel.detailsDialogVisible()).toBe(true);
    expect(viewModel.selectedItem()).toEqual(sampleItems[0]);
    expect(mockGetSignedPhotoUrl).toHaveBeenCalledWith('user/dev/photo1.jpg');
    expect(viewModel.photoUrl()).toBe('https://signed-url.com/photo.jpg');
  });

  it('clears filters when clearFilters is called', () => {
    viewModel.globalFilter.set('test');
    viewModel.selectedZoneId.set('z1');
    viewModel.selectedOccurrenceTypeId.set('occ-1');

    viewModel.clearFilters();

    expect(viewModel.globalFilter()).toBe('');
    expect(viewModel.selectedZoneId()).toBe('');
    expect(viewModel.selectedOccurrenceTypeId()).toBe('');
    expect(mockFindAll).toHaveBeenCalled();
  });
});
