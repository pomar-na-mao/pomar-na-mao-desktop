import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PostgrestError } from '@supabase/supabase-js';
import { OperationsRepository } from './operations-repository';
import { OperationsService } from '../../services/operations/operations-service';
import { SprayingOperationResponse, InspectionOperationResponse } from '../../../domain/models/operations.model';

describe('OperationsRepository', () => {
  let repository: OperationsRepository;
  const mockGetSprayingOperations = vi.fn();
  const mockGetInspectionOperations = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        OperationsRepository,
        {
          provide: OperationsService,
          useValue: {
            getSprayingOperations: mockGetSprayingOperations,
            getInspectionOperations: mockGetInspectionOperations
          }
        }
      ]
    });

    repository = TestBed.inject(OperationsRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('should fetch spraying operations and update signal', async () => {
    const mockData = [{ operation_id: '1' }] as unknown as SprayingOperationResponse[];
    mockGetSprayingOperations.mockResolvedValue({
      data: mockData,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });

    const result = await repository.getSprayingOperations('2023-01-01', '2023-12-31', 'zone-1');

    expect(result.error).toBeNull();
    expect(repository.sprayingOperations()).toEqual(mockData);
    expect(mockGetSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should clear signal and return error on failure', async () => {
    const mockError: PostgrestError = {
      name: 'PostgrestError',
      message: 'Error',
      details: '',
      hint: '',
      code: '500'
    };
    mockGetSprayingOperations.mockResolvedValue({
      data: null,
      error: mockError,
      count: null,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const result = await repository.getSprayingOperations();

    expect(result.error).toEqual(mockError);
    expect(repository.sprayingOperations()).toEqual([]);
  });

  it('should fetch inspection operations and update signal', async () => {
    const mockData = [{ operation_id: '2', plants: [] }] as unknown as InspectionOperationResponse[];
    mockGetInspectionOperations.mockResolvedValue({
      data: mockData,
      error: null,
      count: null,
      status: 200,
      statusText: 'OK'
    });

    const result = await repository.getInspectionOperations('2023-01-01', '2023-12-31', 'zone-1');

    expect(result.error).toBeNull();
    expect(repository.inspectionOperations()).toEqual(mockData);
    expect(mockGetInspectionOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should clear inspection signal and return error on failure', async () => {
    const mockError: PostgrestError = {
      name: 'PostgrestError',
      message: 'Error',
      details: '',
      hint: '',
      code: '500'
    };
    mockGetInspectionOperations.mockResolvedValue({
      data: null,
      error: mockError,
      count: null,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const result = await repository.getInspectionOperations();

    expect(result.error).toEqual(mockError);
    expect(repository.inspectionOperations()).toEqual([]);
  });
});

