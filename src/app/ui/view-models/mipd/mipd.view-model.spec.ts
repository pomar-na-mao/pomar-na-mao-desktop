import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MipdRepository } from '../../../data/repositories/mipd/mipd-repository';
import { OccurrenceTypesRepository } from '../../../data/repositories/occurrence-types/occurrence-types.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { MipdMarking } from '../../../domain/models/mipd.model';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import { MipdViewModel } from './mipd.view-model';

function marking(
  id: string,
  plantId = 'plant-1',
  observedAt = '2026-10-22T10:00:00Z',
  photoObjectPath: string | null = null,
): MipdMarking {
  return {
    operation_id: `operation-${id}`,
    marking_id: id,
    started_at: observedAt,
    observed_at: observedAt,
    plant_id: plantId,
    latitude: -23.403,
    longitude: -49.149,
    zone_name: 'Talhão 1',
    occurrence_type_id: 'type-1',
    occurrence_type_name: 'Broca',
    plant_parts: ['LEAF'],
    photo_object_path: photoObjectPath,
  };
}

describe('MipdViewModel', () => {
  let viewModel: MipdViewModel;
  const markings = signal<MipdMarking[]>([]);
  const isLoading = signal(false);
  const errorMessage = signal<string | null>(null);
  const occurrenceTypes = signal<OccurrenceType[]>([]);
  const zones = signal<Zone[]>([]);
  const regions = signal<Region[]>([]);
  const findMarkings = vi.fn();
  const createSignedPhotoUrl = vi.fn();
  const clear = vi.fn(() => {
    markings.set([]);
    isLoading.set(false);
    errorMessage.set(null);
  });
  const findAll = vi.fn();
  const findAllZones = vi.fn().mockResolvedValue({ error: null });
  const findAllRegions = vi.fn().mockResolvedValue({ error: null });

  beforeEach(() => {
    vi.clearAllMocks();
    markings.set([]);
    isLoading.set(false);
    errorMessage.set(null);
    zones.set([
      {
        id: 'zone-1',
        name: 'Zona A',
        code: 'ZA',
        description: null,
        polygon: {
          type: 'Polygon',
          coordinates: [[[20, 10], [40, 30], [60, 50], [20, 10]]],
        },
        created_at: '',
        updated_at: '',
        local_id: null,
        device_id: null,
        sync_status: 'synced',
        synced_at: null,
      },
    ]);
    regions.set([
      { id: 'r2', created_at: '', longitude: 4, latitude: 3, region: 'ZA', zone_id: 'zone-1', order: 2 },
      { id: 'r1', created_at: '', longitude: 2, latitude: 1, region: 'ZA', zone_id: 'zone-1', order: 1 },
      { id: 'r3', created_at: '', longitude: 6, latitude: 5, region: 'ZA', zone_id: 'zone-1', order: 3 },
    ]);
    occurrenceTypes.set([
      {
        id: 'type-2',
        name: 'Ácaros',
        code: 'mites',
        category: 'PEST_DISEASE',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'type-1',
        name: 'Broca',
        code: 'drill',
        category: 'PEST_DISEASE',
        created_at: '',
        updated_at: '',
      },
      {
        id: 'type-3',
        name: 'Galho quebrado',
        code: 'broken_branch',
        category: 'STRUCTURAL',
        created_at: '',
        updated_at: '',
      },
    ]);
    findMarkings.mockResolvedValue({ error: null });
    createSignedPhotoUrl.mockResolvedValue({ signedUrl: null, error: null });

    TestBed.configureTestingModule({
      providers: [
        MipdViewModel,
        {
          provide: MipdRepository,
          useValue: {
            markings,
            isLoading,
            errorMessage,
            findMarkings,
            createSignedPhotoUrl,
            clear,
          },
        },
        {
          provide: OccurrenceTypesRepository,
          useValue: { occurrenceTypes, findAll },
        },
        {
          provide: ZonesRepository,
          useValue: { zones, findAll: findAllZones },
        },
        {
          provide: RegionsRepository,
          useValue: { regions, findAll: findAllRegions },
        },
        {
          provide: FarmBoundaryService,
          useValue: { getBoundary: vi.fn().mockResolvedValue([]) },
        },
      ],
    });
    viewModel = TestBed.inject(MipdViewModel);
  });

  it('starts on today and lists only sorted PEST_DISEASE options', () => {
    expect(viewModel.startDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(viewModel.endDate()).toBe(viewModel.startDate());
    expect(viewModel.occurrenceTypeOptions()).toEqual([
      { label: 'Todos', value: '' },
      { label: 'Ácaros', value: 'type-2' },
      { label: 'Broca', value: 'type-1' },
    ]);
    expect(viewModel.zoneOptions()).toEqual([
      { label: 'Todas as zonas', value: '' },
      { label: 'Zona A', value: 'zone-1' },
    ]);
  });

  it('keeps farm-independent zone polygons available in region order', () => {
    expect(findAllZones).toHaveBeenCalled();
    expect(findAllRegions).toHaveBeenCalled();
    expect(viewModel.zonePolygons()).toEqual([
      {
        id: 'zone-1',
        name: 'Zona A',
        color: '#0ea5e9',
        coordinates: [[1, 2], [3, 4], [5, 6]],
      },
    ]);

    viewModel.clearFilters();

    expect(viewModel.zonePolygons()).toHaveLength(1);
  });

  it('queries all pest and disease types when only the date range is selected', async () => {
    viewModel.startDate.set('2026-10-01');
    viewModel.endDate.set('2026-10-22');
    viewModel.selectedOccurrenceTypeId.set('');
    TestBed.flushEffects();
    await Promise.resolve();

    expect(viewModel.hasActiveFilters()).toBe(true);
    expect(findMarkings).toHaveBeenCalledWith(
      '2026-10-01',
      '2026-10-22',
      null,
      null,
    );
  });

  it('queries when occurrence type, zone and date range are valid', async () => {
    viewModel.startDate.set('2026-10-01');
    viewModel.endDate.set('2026-10-22');
    viewModel.selectedOccurrenceTypeId.set('type-1');
    viewModel.selectedZoneId.set('zone-1');
    TestBed.flushEffects();
    await Promise.resolve();

    expect(findMarkings).toHaveBeenCalledWith(
      '2026-10-01',
      '2026-10-22',
      'type-1',
      'zone-1',
    );
  });

  it('fits the map to the selected zone polygon immediately', () => {
    const fitBounds = vi.fn();
    (
      viewModel as unknown as {
        map: { fitBounds: typeof fitBounds } | null;
      }
    ).map = { fitBounds };

    viewModel.selectedZoneId.set('zone-1');
    TestBed.flushEffects();

    const bounds = fitBounds.mock.calls.at(-1)?.[0];
    expect(bounds.getSouthWest().lat).toBe(1);
    expect(bounds.getSouthWest().lng).toBe(2);
    expect(bounds.getNorthEast().lat).toBe(5);
    expect(bounds.getNorthEast().lng).toBe(6);
    expect(fitBounds).toHaveBeenLastCalledWith(bounds, {
      padding: [48, 48],
      maxZoom: 18,
    });
  });

  it('clears the selected zone with the other filters', () => {
    viewModel.selectedZoneId.set('zone-1');

    viewModel.clearFilters();

    expect(viewModel.selectedZoneId()).toBe('');
  });

  it('clears results for incomplete or invalid filters', () => {
    viewModel.selectedOccurrenceTypeId.set('type-1');
    viewModel.startDate.set('2026-10-23');
    viewModel.endDate.set('2026-10-22');
    TestBed.flushEffects();

    expect(viewModel.dateRangeInvalid()).toBe(true);
    expect(clear).toHaveBeenCalled();
    expect(findMarkings).not.toHaveBeenCalled();
  });

  it('groups a plant once and orders its history newest first', () => {
    const groups = viewModel.groupMarkings([
      marking('old', 'plant-1', '2026-10-20T10:00:00Z'),
      marking('other', 'plant-2', '2026-10-21T10:00:00Z'),
      marking('new', 'plant-1', '2026-10-22T10:00:00Z'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].markings.map((item) => item.marking_id)).toEqual([
      'new',
      'old',
    ]);
  });

  it('navigates selected history without crossing its bounds', () => {
    viewModel.selectPlantMarkings([
      marking('old', 'plant-1', '2026-10-20T10:00:00Z'),
      marking('new', 'plant-1', '2026-10-22T10:00:00Z'),
    ]);

    expect(viewModel.selectedMarking()?.marking_id).toBe('new');
    viewModel.navigateMarking('next');
    expect(viewModel.selectedMarking()?.marking_id).toBe('old');
    viewModel.navigateMarking('next');
    expect(viewModel.selectedMarking()?.marking_id).toBe('old');
    viewModel.navigateMarking('prev');
    expect(viewModel.selectedMarking()?.marking_id).toBe('new');
  });

  it('ignores a signed URL that resolves after another marking is selected', async () => {
    let resolveFirst!: (value: unknown) => void;
    createSignedPhotoUrl
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFirst = resolve;
        }),
      )
      .mockResolvedValueOnce({
        signedUrl: 'https://signed.example/new.jpg',
        error: null,
      });

    viewModel.selectPlantMarkings([
      marking('first', 'plant-1', '2026-10-22T10:00:00Z', 'first.jpg'),
    ]);
    viewModel.selectPlantMarkings([
      marking('second', 'plant-2', '2026-10-23T10:00:00Z', 'second.jpg'),
    ]);
    await Promise.resolve();
    resolveFirst({
      signedUrl: 'https://signed.example/stale.jpg',
      error: null,
    });
    await Promise.resolve();

    expect(viewModel.signedPhotoUrl()).toBe(
      'https://signed.example/new.jpg',
    );
  });

  it('distinguishes no photo from an unavailable photo', async () => {
    viewModel.selectPlantMarkings([marking('without-photo')]);
    expect(viewModel.isPhotoLoading()).toBe(false);
    expect(viewModel.photoError()).toBeNull();

    createSignedPhotoUrl.mockResolvedValueOnce({
      signedUrl: null,
      error: new Error('failed'),
    });
    viewModel.selectPlantMarkings([
      marking('with-photo', 'plant-1', '2026-10-22T10:00:00Z', 'photo.jpg'),
    ]);
    await Promise.resolve();

    expect(viewModel.photoError()).toContain('Não foi possível');
  });
});
