import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MessageService } from '../../../data/services/message/message.service';
import { Region } from '../../../domain/models/regions.model';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { RegionsViewModel } from './regions.view-model';

describe('RegionsViewModel', () => {
  let viewModel: RegionsViewModel;

  const regionsSignal = signal<Region[]>([]);
  const mockRegionsRepository = {
    regions: regionsSignal,
    findAll: vi.fn(),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    regionsSignal.set([]);

    TestBed.configureTestingModule({
      providers: [
        RegionsViewModel,
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: MessageService, useValue: mockMessageService },
      ],
    });

    viewModel = TestBed.inject(RegionsViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should calculate total records and unique regions', () => {
    regionsSignal.set([
      { id: '1', region: 'A', latitude: -1, longitude: -2, created_at: '2026-05-04T00:00:00Z' },
      { id: '2', region: 'A', latitude: -3, longitude: -4, created_at: '2026-05-04T00:00:00Z' },
      { id: '3', region: 'B', latitude: -5, longitude: -6, created_at: '2026-05-04T00:00:00Z' },
    ]);

    expect(viewModel.stats()).toEqual({ total: 3, unique: 2 });
  });

  it('should load regions and toggle loading state', async () => {
    mockRegionsRepository.findAll.mockResolvedValue({ error: null });

    const loadPromise = viewModel.loadRegions();
    expect(viewModel.isLoading()).toBe(true);

    await loadPromise;

    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoading()).toBe(false);
  });
});
