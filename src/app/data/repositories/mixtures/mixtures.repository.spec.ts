import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MixturesRepository } from './mixtures.repository';
import { MixturesService } from '../../services/mixtures/mixtures.service';
import type { MixtureDraft, MixtureItem } from '../../../domain/models/mixture.model';

describe('MixturesRepository', () => {
  let repository: MixturesRepository;
  const mockMixturesService = {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MixturesRepository,
        {
          provide: MixturesService,
          useValue: mockMixturesService,
        },
      ],
    });

    repository = TestBed.inject(MixturesRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
    expect(repository.mixtures()).toEqual([]);
  });

  it('findAll should populate mixtures signal sorted', async () => {
    const mockList: MixtureItem[] = [
      {
        id: '1',
        name: 'B Calda',
        registered_by_name: 'User',
        registered_by_email: 'user@test.com',
        is_active: true,
        observations: null,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'A Calda',
        registered_by_name: 'User',
        registered_by_email: 'user@test.com',
        is_active: true,
        observations: null,
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
    ];

    mockMixturesService.findAll.mockResolvedValue({ data: mockList, error: null });

    const result = await repository.findAll();

    expect(result.error).toBeNull();
    expect(repository.mixtures().length).toBe(2);
    // Updated at desc
    expect(repository.mixtures()[0].id).toBe('2');
  });

  it('create should add created item to signal', async () => {
    const draft: MixtureDraft = {
      name: 'Nova Calda',
      registered_by_name: 'Tester',
      registered_by_email: 'tester@test.com',
      is_active: true,
      observations: null,
      inputs: [],
    };

    const created: MixtureItem = {
      id: 'new-id',
      name: draft.name,
      registered_by_name: draft.registered_by_name,
      registered_by_email: draft.registered_by_email,
      is_active: draft.is_active,
      observations: draft.observations,
      inputs: [],
      created_at: '2026-10-28T00:00:00Z',
      updated_at: '2026-10-28T00:00:00Z',
    };

    mockMixturesService.create.mockResolvedValue({ data: created, error: null });

    const result = await repository.create(draft);

    expect(result.data).toBe(created);
    expect(repository.mixtures().some((m) => m.id === 'new-id')).toBe(true);
  });

  it('deleteMany should remove deleted items from signal', async () => {
    const initial: MixtureItem[] = [
      {
        id: '1',
        name: 'Calda 1',
        registered_by_name: 'User',
        registered_by_email: 'user@test.com',
        is_active: true,
        observations: null,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Calda 2',
        registered_by_name: 'User',
        registered_by_email: 'user@test.com',
        is_active: true,
        observations: null,
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
    ];

    repository.mixtures.set(initial);
    mockMixturesService.deleteMany.mockResolvedValue({ data: null, error: null });

    await repository.deleteMany(['1']);

    expect(repository.mixtures().length).toBe(1);
    expect(repository.mixtures()[0].id).toBe('2');
  });
});
