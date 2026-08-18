import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Zone } from '../../../domain/models/zone.model';
import { ZonesService } from '../../services/zones/zones-service';
import { ZonesRepository } from './zones-repository';

describe('ZonesRepository', () => {
  let repo: ZonesRepository;

  const findAll = vi.fn();
  const findById = vi.fn();
  const createWithRegions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ZonesRepository,
        {
          provide: ZonesService,
          useValue: {
            findAll,
            findById,
            createWithRegions,
          },
        },
      ],
    });

    repo = TestBed.inject(ZonesRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findAll should update the zones signal ordered by name', async () => {
    const zones: Zone[] = [
      {
        id: 'zone-2',
        name: 'Zona B',
        code: null,
        description: null,
        created_at: '2026-03-31T10:00:00Z',
        updated_at: '2026-03-31T10:00:00Z',
        local_id: null,
        device_id: null,
        sync_status: 'synced',
        synced_at: null,
      },
      {
        id: 'zone-1',
        name: 'Zona A',
        code: null,
        description: null,
        created_at: '2026-03-31T10:00:00Z',
        updated_at: '2026-03-31T10:00:00Z',
        local_id: null,
        device_id: null,
        sync_status: 'synced',
        synced_at: null,
      },
    ];
    findAll.mockResolvedValue({ data: zones, error: null });

    await repo.findAll();

    expect(repo.zones().map((zone) => zone.name)).toEqual(['Zona A', 'Zona B']);
  });

  it('findById should store the current zone and return it on success', async () => {
    const zone: Zone = {
      id: 'zone-1',
      name: 'Zona A',
      code: null,
      description: null,
      created_at: '2026-03-31T10:00:00Z',
      updated_at: '2026-03-31T10:00:00Z',
      local_id: null,
      device_id: null,
      sync_status: 'synced',
      synced_at: null,
    };
    findById.mockResolvedValue({ data: zone, error: null });

    const result = await repo.findById('zone-1');

    expect(findById).toHaveBeenCalledWith('zone-1');
    expect(repo.currentZone()).toEqual(zone);
    expect(result).toEqual(zone);
  });

  it('findById should clear the current zone and return null on failure', async () => {
    repo.currentZone.set({
      id: 'zone-1',
      name: 'Zona A',
      code: null,
      description: null,
      created_at: '2026-03-31T10:00:00Z',
      updated_at: '2026-03-31T10:00:00Z',
      local_id: null,
      device_id: null,
      sync_status: 'synced',
      synced_at: null,
    });
    findById.mockResolvedValue({ data: null, error: new Error('failed') });

    const result = await repo.findById('zone-1');

    expect(repo.currentZone()).toBeNull();
    expect(result).toBeNull();
  });

  it('createWithRegions should return the RPC result on success', async () => {
    createWithRegions.mockResolvedValue({
      data: {
        zone_id: 'zone-1',
        zone_name: 'Zona A',
        region_points_count: 3,
        polygon: { type: 'Polygon', coordinates: [] },
      },
      error: null,
    });

    const result = await repo.createWithRegions({
      name: 'Zona A',
      code: 'ZA',
      polygonGeojson: {
        type: 'Polygon',
        coordinates: [
          [
            [2, 1],
            [4, 3],
            [6, 5],
            [2, 1],
          ],
        ],
      },
      points: [
        { latitude: 1, longitude: 2 },
        { latitude: 3, longitude: 4 },
        { latitude: 5, longitude: 6 },
      ],
    });

    expect(result.data?.zone_id).toBe('zone-1');
    expect(result.error).toBeNull();
    expect(result.message).toBeNull();
  });

  it('createWithRegions should map duplicate and invalid polygon errors', async () => {
    createWithRegions.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate', details: '', hint: '' },
    });

    const duplicate = await repo.createWithRegions({
      name: 'Zona A',
      code: 'ZA',
      polygonGeojson: { type: 'Polygon', coordinates: [] },
      points: [],
    });

    createWithRegions.mockResolvedValueOnce({
      data: null,
      error: {
        code: '22023',
        message: 'invalid polygon',
        details: '',
        hint: '',
      },
    });

    const invalidPolygon = await repo.createWithRegions({
      name: 'Zona B',
      code: 'ZB',
      polygonGeojson: { type: 'Polygon', coordinates: [] },
      points: [],
    });

    expect(duplicate.message).toBe('Ja existe uma zona com este nome.');
    expect(invalidPolygon.message).toBe(
      'Poligono invalido. Revise o desenho e tente novamente.',
    );
  });

  it('createWithRegions should map duplicated code inconsistency errors', async () => {
    createWithRegions.mockResolvedValueOnce({
      data: null,
      error: {
        code: '23505',
        message: 'Mais de uma zona usa este codigo.',
        details: '',
        hint: '',
      },
    });

    const result = await repo.createWithRegions({
      name: 'Zona A',
      code: 'ZA',
      polygonGeojson: { type: 'Polygon', coordinates: [] },
      points: [],
    });

    expect(result.message).toBe(
      'Mais de uma zona usa este codigo. Corrija as zonas existentes antes de salvar.',
    );
  });
});
