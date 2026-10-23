import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import {
  MIPD_SIGNED_URL_TTL_SECONDS,
  MipdService,
} from './mipd-service';

describe('MipdService', () => {
  let service: MipdService;
  const rpc = vi.fn();
  const createSignedUrl = vi.fn();
  const from = vi.fn(() => ({ createSignedUrl }));

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        MipdService,
        {
          provide: SupabaseService,
          useValue: {
            supabase: {
              rpc,
              storage: { from },
            } as unknown as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(MipdService);
  });

  it('calls the MIPD RPC with only supplied filters and caches equivalents', async () => {
    const response = {
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    rpc.mockResolvedValue(response);

    await service.getMarkings('2026-10-22', null, 'type-1', 'zone-1');
    await service.getMarkings('2026-10-22', null, 'type-1', 'zone-1');

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('get_mipd_operations', {
      p_start_date: '2026-10-22',
      p_occurrence_type_id: 'type-1',
      p_zone_id: 'zone-1',
    });
  });

  it('omits the zone argument when all zones are selected', async () => {
    rpc.mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    });

    await service.getMarkings('2026-10-22', '2026-10-22', null, null);

    expect(rpc).toHaveBeenCalledWith('get_mipd_operations', {
      p_start_date: '2026-10-22',
      p_end_date: '2026-10-22',
    });
  });

  it('does not call Storage when a marking has no photo', async () => {
    await expect(service.createSignedPhotoUrl(null)).resolves.toEqual({
      signedUrl: null,
      error: null,
    });
    expect(from).not.toHaveBeenCalled();
  });

  it('creates a five-minute signed URL in the private MIPD bucket', async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://signed.example/photo' },
      error: null,
    });

    await expect(
      service.createSignedPhotoUrl('user/device/marking.jpg'),
    ).resolves.toEqual({
      signedUrl: 'https://signed.example/photo',
      error: null,
    });
    expect(from).toHaveBeenCalledWith('mipd-plant-photos');
    expect(createSignedUrl).toHaveBeenCalledWith(
      'user/device/marking.jpg',
      MIPD_SIGNED_URL_TTL_SECONDS,
    );
  });

  it('returns Storage signing errors without hiding them', async () => {
    const error = new Error('Storage unavailable');
    createSignedUrl.mockResolvedValue({ data: null, error });

    await expect(service.createSignedPhotoUrl('photo.jpg')).resolves.toEqual({
      signedUrl: null,
      error,
    });
  });
});
