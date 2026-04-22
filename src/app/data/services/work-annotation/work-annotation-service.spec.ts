import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { WorkAnnotationService } from './work-annotation-service';

describe('WorkAnnotationService', () => {
  let service: WorkAnnotationService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkAnnotationService,
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

    service = TestBed.inject(WorkAnnotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getWorkAnnotations should query annotations ordered by creation date', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.getWorkAnnotations();

    expect(mockFrom).toHaveBeenCalledWith('work_annotations');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });

  it('approveWorkAnnotation should call the rpc with the annotation id', async () => {
    const mockResponse = { data: 'ok', error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.approveWorkAnnotation('annotation-1');

    expect(mockRpc).toHaveBeenCalledWith('approve_work_annotation', {
      p_annotation_id: 'annotation-1'
    });
    expect(result).toBe(mockResponse);
  });
});
