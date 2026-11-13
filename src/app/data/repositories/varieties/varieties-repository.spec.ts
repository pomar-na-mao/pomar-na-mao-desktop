import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Variety } from '../../../domain/models/variety.model';
import { VarietiesService } from '../../services/varieties/varieties-service';
import { VarietiesRepository } from './varieties-repository';

function variety(
  id: number,
  name: string,
  updatedAt = '2026-10-20T10:00:00Z',
): Variety {
  return {
    id,
    name,
    description: null,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: updatedAt,
  };
}

describe('VarietiesRepository', () => {
  let repository: VarietiesRepository;
  const service = {
    findAll: vi.fn(),
    create: vi.fn(),
    createWithPlants: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        VarietiesRepository,
        { provide: VarietiesService, useValue: service },
      ],
    });
    repository = TestBed.inject(VarietiesRepository);
  });

  it('loads and sorts varieties by most recent update', async () => {
    service.findAll.mockResolvedValue({
      data: [variety(1, 'Breda'), variety(2, 'Ouro', '2026-10-20T11:00:00Z')],
      error: null,
    });

    await repository.findAll();

    expect(repository.varieties().map((item) => item.name)).toEqual([
      'Ouro',
      'Breda',
    ]);
  });

  it('adds and replaces persisted rows', async () => {
    repository.varieties.set([variety(1, 'Hass')]);
    const created = variety(2, 'Breda');
    const updated = {
      ...variety(1, 'Hass premium'),
      updated_at: '2026-10-20T11:00:00Z',
    };
    service.create.mockResolvedValue({ data: created, error: null });
    service.update.mockResolvedValue({ data: updated, error: null });

    await repository.create({ name: 'Breda', description: null });
    await repository.update(1, {
      name: 'Hass premium',
      description: null,
    });

    expect(repository.varieties()).toEqual([updated, created]);
  });

  it('removes multiple rows only after a successful deletion', async () => {
    repository.varieties.set([
      variety(1, 'A'),
      variety(2, 'B'),
      variety(3, 'C'),
    ]);
    service.deleteMany.mockResolvedValueOnce({ error: { message: 'failed' } });
    service.deleteMany.mockResolvedValueOnce({ error: null });

    await repository.deleteMany([1, 3]);
    expect(repository.varieties()).toHaveLength(3);

    await repository.deleteMany([1, 3]);
    expect(repository.varieties()).toEqual([variety(2, 'B')]);
  });

  it('preserves collection state when load and writes fail', async () => {
    const existing = variety(1, 'Existente');
    repository.varieties.set([existing]);
    service.findAll.mockResolvedValue({
      data: null,
      error: { message: 'failed' },
    });
    service.create.mockResolvedValue({
      data: null,
      error: { message: 'failed' },
    });
    service.update.mockResolvedValue({
      data: null,
      error: { message: 'failed' },
    });

    await repository.findAll();
    await repository.create({ name: 'Nova', description: null });
    await repository.update(1, { name: 'Alterada', description: null });

    expect(repository.varieties()).toEqual([existing]);
  });

  it('adds variety to collection when createWithPlants succeeds', async () => {
    const existing = variety(1, 'Hass');
    repository.varieties.set([existing]);
    const created = variety(2, 'Geada');
    service.createWithPlants.mockResolvedValue({
      data: { variety: created, plants_updated_count: 15 },
      error: null,
    });

    const result = await repository.createWithPlants({
      name: 'Geada',
      description: null,
      polygonGeojson: {
        type: 'Polygon',
        coordinates: [
          [
            [-49.1, -23.1],
            [-49.2, -23.1],
            [-49.2, -23.2],
            [-49.1, -23.1],
          ],
        ],
      },
    });

    expect(result.data?.plants_updated_count).toBe(15);
    expect(repository.varieties()).toContainEqual(created);
  });
});
