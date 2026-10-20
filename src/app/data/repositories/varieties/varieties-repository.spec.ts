import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Variety } from '../../../domain/models/variety.model';
import { VarietiesService } from '../../services/varieties/varieties-service';
import { VarietiesRepository } from './varieties-repository';

function variety(id: number, name: string): Variety {
  return {
    id,
    name,
    description: null,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  };
}

describe('VarietiesRepository', () => {
  let repository: VarietiesRepository;
  const service = {
    findAll: vi.fn(),
    create: vi.fn(),
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

  it('loads and sorts varieties by name', async () => {
    service.findAll.mockResolvedValue({
      data: [variety(2, 'Ouro'), variety(1, 'Breda')],
      error: null,
    });

    await repository.findAll();

    expect(repository.varieties().map((item) => item.name)).toEqual([
      'Breda',
      'Ouro',
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

    expect(repository.varieties()).toEqual([created, updated]);
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
    service.findAll.mockResolvedValue({ data: null, error: { message: 'failed' } });
    service.create.mockResolvedValue({ data: null, error: { message: 'failed' } });
    service.update.mockResolvedValue({ data: null, error: { message: 'failed' } });

    await repository.findAll();
    await repository.create({ name: 'Nova', description: null });
    await repository.update(1, { name: 'Alterada', description: null });

    expect(repository.varieties()).toEqual([existing]);
  });
});
