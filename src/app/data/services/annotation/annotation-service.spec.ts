import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { AnnotationService } from './annotation-service';

describe('AnnotationService', () => {
  let service: AnnotationService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AnnotationService,
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

    service = TestBed.inject(AnnotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAnnotations should query annotations ordered by creation date', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.getAnnotations();

    expect(mockFrom).toHaveBeenCalledWith('annotations');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });

  it('approveAnnotation should call the rpc with the annotation id', async () => {
    const mockResponse = { data: 'ok', error: null };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.approveAnnotation('annotation-1');

    expect(mockRpc).toHaveBeenCalledWith('approve_annotation', {
      p_annotation_id: 'annotation-1'
    });
    expect(result).toBe(mockResponse);
  });
});
