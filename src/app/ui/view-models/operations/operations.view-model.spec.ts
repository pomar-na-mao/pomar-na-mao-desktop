import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OperationsViewModel } from './operations.view-model';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { signal } from '@angular/core';

describe('OperationsViewModel', () => {
  let viewModel: OperationsViewModel;
  const mockSprayingOperationsSignal = signal([]);
  const mockGetSprayingOperations = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSprayingOperationsSignal.set([]);

    TestBed.configureTestingModule({
      providers: [
        OperationsViewModel,
        {
          provide: OperationsRepository,
          useValue: {
            getSprayingOperations: mockGetSprayingOperations,
            sprayingOperations: mockSprayingOperationsSignal
          }
        }
      ]
    });

    viewModel = TestBed.inject(OperationsViewModel);
  });

  it('should be created', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should fetch spraying operations when type is pulverizacao', async () => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedZoneId.set('zone-1');
    viewModel.selectedOperation.set('pulverizacao');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should clear spraying operations when type is not pulverizacao', async () => {
    viewModel.selectedOperation.set('inspecao');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetSprayingOperations).not.toHaveBeenCalled();
    expect(mockSprayingOperationsSignal()).toEqual([]);
  });
});
