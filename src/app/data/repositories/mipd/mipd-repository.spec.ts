import { TestBed } from '@angular/core/testing';
import type { PostgrestError } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MipdMarking } from '../../../domain/models/mipd.model';
import { MipdService } from '../../services/mipd/mipd-service';
import { MipdRepository } from './mipd-repository';

describe('MipdRepository', () => {
  let repository: MipdRepository;
  const getMarkings = vi.fn();
  const createSignedPhotoUrl = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        MipdRepository,
        {
          provide: MipdService,
          useValue: { getMarkings, createSignedPhotoUrl },
        },
      ],
    });
    repository = TestBed.inject(MipdRepository);
  });

  it('stores successful results and forwards all filters', async () => {
    const data = [{ marking_id: 'marking-1' }] as MipdMarking[];
    getMarkings.mockResolvedValue({ data, error: null });

    await repository.findMarkings(
      '2026-10-01',
      '2026-10-22',
      'type-1',
      'zone-1',
    );

    expect(getMarkings).toHaveBeenCalledWith(
      '2026-10-01',
      '2026-10-22',
      'type-1',
      'zone-1',
    );
    expect(repository.markings()).toEqual(data);
    expect(repository.errorMessage()).toBeNull();
    expect(repository.isLoading()).toBe(false);
  });

  it('clears stale data and exposes an error from the current request', async () => {
    const error = {
      message: 'Failed',
      details: '',
      hint: '',
      code: '500',
      name: 'PostgrestError',
    } as PostgrestError;
    repository.markings.set([{ marking_id: 'old' }] as MipdMarking[]);
    getMarkings.mockResolvedValue({ data: null, error });

    await repository.findMarkings();

    expect(repository.markings()).toEqual([]);
    expect(repository.errorMessage()).toBe('Failed');
  });

  it('keeps the newest success when requests finish out of order', async () => {
    let resolveFirst!: (value: unknown) => void;
    const firstResponse = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const newest = [{ marking_id: 'newest' }] as MipdMarking[];
    getMarkings
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce({ data: newest, error: null });

    const first = repository.findMarkings(null, null, 'type-old');
    await repository.findMarkings(null, null, 'type-new');
    resolveFirst({
      data: [{ marking_id: 'stale' }],
      error: null,
    });
    await first;

    expect(repository.markings()).toEqual(newest);
  });

  it('does not let a stale error clear the newest success', async () => {
    let resolveFirst!: (value: unknown) => void;
    const firstResponse = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const newest = [{ marking_id: 'newest' }] as MipdMarking[];
    getMarkings
      .mockReturnValueOnce(firstResponse)
      .mockResolvedValueOnce({ data: newest, error: null });

    const first = repository.findMarkings(null, null, 'type-old');
    await repository.findMarkings(null, null, 'type-new');
    resolveFirst({
      data: null,
      error: { message: 'stale error' },
    });
    await first;

    expect(repository.markings()).toEqual(newest);
    expect(repository.errorMessage()).toBeNull();
  });
});
