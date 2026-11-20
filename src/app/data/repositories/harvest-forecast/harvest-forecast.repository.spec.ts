import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HarvestForecastService } from '../../services/harvest-forecast/harvest-forecast.service';
import { HarvestForecastRepository } from './harvest-forecast.repository';

describe('HarvestForecastRepository', () => {
  const findAll = vi.fn();
  let repository: HarvestForecastRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        HarvestForecastRepository,
        { provide: HarvestForecastService, useValue: { findAll } },
      ],
    });
    repository = TestBed.inject(HarvestForecastRepository);
  });

  it('stores successful results and clears failures', async () => {
    const data = [{ plant_id: 'p-1' }];
    findAll.mockResolvedValueOnce({ data, error: null });
    await repository.findAll();
    expect(repository.items()).toEqual(data);

    const error = { code: '500', message: 'failed', details: '', hint: '' };
    findAll.mockResolvedValueOnce({ data: null, error });
    await repository.findAll();
    expect(repository.items()).toEqual([]);
    expect(repository.error()).toBe(error);
  });

  it('allows only the latest request to update signals', async () => {
    let resolveOld!: (value: unknown) => void;
    const oldRequest = new Promise((resolve) => { resolveOld = resolve; });
    findAll
      .mockReturnValueOnce(oldRequest)
      .mockResolvedValueOnce({ data: [{ plant_id: 'new' }], error: null });

    const oldPromise = repository.findAll({ zoneId: 'old' });
    await repository.findAll({ zoneId: 'new' });
    resolveOld({ data: [{ plant_id: 'old' }], error: null });
    await oldPromise;
    expect(repository.items()).toEqual([{ plant_id: 'new' }]);
  });

  it('ignores a stale error after a newer success', async () => {
    let resolveOld!: (value: unknown) => void;
    findAll
      .mockReturnValueOnce(new Promise((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce({ data: [{ plant_id: 'current' }], error: null });

    const oldPromise = repository.findAll({ zoneId: 'old' });
    await repository.findAll({ zoneId: 'current' });
    resolveOld({
      data: null,
      error: { code: '500', message: 'late error', details: '', hint: '' },
    });
    await oldPromise;

    expect(repository.items()).toEqual([{ plant_id: 'current' }]);
    expect(repository.error()).toBeNull();
  });

  it('invalidates an in-flight request when cleared', async () => {
    let resolveRequest!: (value: unknown) => void;
    findAll.mockReturnValueOnce(new Promise((resolve) => { resolveRequest = resolve; }));
    const pending = repository.findAll();
    repository.clear();
    resolveRequest({ data: [{ plant_id: 'late' }], error: null });
    await pending;
    expect(repository.items()).toEqual([]);
    expect(repository.isLoading()).toBe(false);
  });
});
