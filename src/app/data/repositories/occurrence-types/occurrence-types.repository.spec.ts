import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { OccurrenceTypesService } from '../../services/occurrence-types/occurrence-types.service';
import { OccurrenceTypesRepository } from './occurrence-types.repository';

function occurrenceType(
  id: string,
  name: string,
  updatedAt = '2026-10-20T10:00:00Z',
): OccurrenceType {
  return {
    id,
    name,
    code: name.toLowerCase(),
    category: 'STRUCTURAL',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: updatedAt,
  };
}

describe('OccurrenceTypesRepository', () => {
  let repository: OccurrenceTypesRepository;
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
        OccurrenceTypesRepository,
        { provide: OccurrenceTypesService, useValue: service },
      ],
    });
    repository = TestBed.inject(OccurrenceTypesRepository);
  });

  it('loads and sorts occurrence types by most recent update', async () => {
    service.findAll.mockResolvedValue({
      data: [
        occurrenceType('1', 'Ácaros'),
        occurrenceType('2', 'Tripes', '2026-10-20T11:00:00Z'),
      ],
      error: null,
    });

    await repository.findAll();

    expect(repository.occurrenceTypes().map((item) => item.name)).toEqual([
      'Tripes',
      'Ácaros',
    ]);
  });

  it('adds and replaces persisted rows', async () => {
    repository.occurrenceTypes.set([occurrenceType('1', 'Ácaros')]);
    const created = occurrenceType('2', 'Broca');
    const updated = {
      ...occurrenceType('1', 'Ácaros severos'),
      updated_at: '2026-10-20T11:00:00Z',
    };
    service.create.mockResolvedValue({ data: created, error: null });
    service.update.mockResolvedValue({ data: updated, error: null });

    await repository.create({
      name: 'Broca',
      code: 'drill',
      category: 'PEST_DISEASE',
    });
    await repository.update('1', {
      name: 'Ácaros severos',
      code: 'mites',
      category: 'PEST_DISEASE',
    });

    expect(repository.occurrenceTypes()).toEqual([updated, created]);
  });

  it('removes multiple rows only after a successful deletion', async () => {
    repository.occurrenceTypes.set([
      occurrenceType('1', 'A'),
      occurrenceType('2', 'B'),
      occurrenceType('3', 'C'),
    ]);
    service.deleteMany.mockResolvedValueOnce({ error: { message: 'failed' } });
    service.deleteMany.mockResolvedValueOnce({ error: null });

    await repository.deleteMany(['1', '3']);
    expect(repository.occurrenceTypes()).toHaveLength(3);

    await repository.deleteMany(['1', '3']);
    expect(repository.occurrenceTypes()).toEqual([occurrenceType('2', 'B')]);
  });

  it('preserves collection state when load and writes fail', async () => {
    const existing = occurrenceType('1', 'Existente');
    repository.occurrenceTypes.set([existing]);
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
    await repository.create({
      name: 'Nova',
      code: 'new',
      category: 'ANTHROPIC',
    });
    await repository.update('1', {
      name: 'Alterada',
      code: 'changed',
      category: 'ENVIRONMENTAL',
    });

    expect(repository.occurrenceTypes()).toEqual([existing]);
  });
});
