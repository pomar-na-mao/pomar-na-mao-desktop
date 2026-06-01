import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Zone } from '../../../domain/models/zone.model';
import { ZonesService } from '../../services/zones/zones-service';
import { ZonesRepository } from './zones-repository';

describe('ZonesRepository', () => {
  let repo: ZonesRepository;

  const findAll = vi.fn();
  const findById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ZonesRepository,
        {
          provide: ZonesService,
          useValue: {
            findAll,
            findById
          }
        }
      ]
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
      }
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
});
