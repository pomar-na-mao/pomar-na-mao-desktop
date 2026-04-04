import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { InspectRoutinePlantsService } from './inspect-routine-plants-service';

describe('InspectRoutinePlantsService', () => {
  let service: InspectRoutinePlantsService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectRoutinePlantsService,
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

    service = TestBed.inject(InspectRoutinePlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findByInspectRoutineId should query plants by routine id', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findByInspectRoutineId(7);

    expect(mockFrom).toHaveBeenCalledWith('inspect_routines_plants');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('routine_id', 7);
    expect(order).toHaveBeenCalledWith('id', { ascending: true });
    expect(result).toBe(mockResponse);
  });

  it('updatePlantFromInspectRoutine should call the rpc with payload', async () => {
    const mockResponse = { data: null, error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.updatePlantFromInspectRoutine(
      'plant-1',
      { mites: true },
      'irp-1',
      { region: 'North' }
    );

    expect(mockRpc).toHaveBeenCalledWith('update_plant_from_inspect_routine', {
      plant_id: 'plant-1',
      occurrences: { mites: true },
      inspect_routine_plant_id: 'irp-1',
      informations: { region: 'North' }
    });
    expect(result).toBe(mockResponse);
  });

  it('approveInspectAnnotation should call the rpc with the annotation id', async () => {
    const mockResponse = { data: null, error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.approveInspectAnnotation('annotation-1');

    expect(mockRpc).toHaveBeenCalledWith('approve_inspect_annotation', {
      p_annotation_id: 'annotation-1'
    });
    expect(result).toBe(mockResponse);
  });
});
