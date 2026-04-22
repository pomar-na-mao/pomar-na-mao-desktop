import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { WorkRoutinePlantsService } from './work-routine-plants-service';

describe('WorkRoutinePlantsService', () => {
  let service: WorkRoutinePlantsService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkRoutinePlantsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({
              from: mockFrom,
              rpc: mockRpc
            }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(WorkRoutinePlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findByWorkRoutineId should query plants by routine id', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findByWorkRoutineId(7);

    expect(mockFrom).toHaveBeenCalledWith('work_routines_plants');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('routine_id', 7);
    expect(order).toHaveBeenCalledWith('id', { ascending: true });
    expect(result).toBe(mockResponse);
  });

  it('updatePlantFromWorkRoutine should call the rpc with payload', async () => {
    const mockResponse = { data: null, error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.updatePlantFromWorkRoutine(
      'plant-1',
      { mites: true },
      'irp-1',
      { region: 'North' }
    );

    expect(mockRpc).toHaveBeenCalledWith('update_plant_from_work_routine', {
      plant_id: 'plant-1',
      occurrences: { mites: true },
      work_routine_plant_id: 'irp-1',
      informations: { region: 'North' }
    });
    expect(result).toBe(mockResponse);
  });

  it('approveWorkAnnotation should call the rpc with the annotation id', async () => {
    const mockResponse = { data: null, error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.approveWorkAnnotation('annotation-1');

    expect(mockRpc).toHaveBeenCalledWith('approve_work_annotation', {
      p_annotation_id: 'annotation-1'
    });
    expect(result).toBe(mockResponse);
  });
});
