import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { MipdService } from './mipd.service';

describe('MipdService', () => {
  let service: MipdService;
  const mockRpc = vi.fn();
  const mockFrom = vi.fn();
  const mockUpload = vi.fn();
  const mockCreateSignedUrl = vi.fn();
  const mockGetUser = vi.fn();

  const mockSupabaseClient = {
    rpc: mockRpc,
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
        createSignedUrl: mockCreateSignedUrl,
      }),
    },
  };

  const mockRequestCache = {
    read: vi.fn().mockImplementation((_opts, queryFn) => queryFn()),
    invalidate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MipdService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient,
          },
        },
        {
          provide: SupabaseRequestCacheService,
          useValue: mockRequestCache,
        },
      ],
    });

    service = TestBed.inject(MipdService);
  });

  it('calls get_mipd_operations with mapped filter parameters', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ operation_id: 'op-1', occurrence_type_name: 'Cancro' }],
      error: null,
    });

    const res = await service.getMipdOperations({
      startDate: '2026-11-01',
      endDate: '2026-11-12',
      zoneId: 'zone-1',
      occurrenceTypeIds: ['occ-1', 'occ-2'],
    });

    expect(mockRpc).toHaveBeenCalledWith('get_mipd_operations', {
      p_start_date: '2026-11-01',
      p_end_date: '2026-11-12',
      p_zone_id: 'zone-1',
      p_occurrence_type_ids: ['occ-1', 'occ-2'],
    });
    expect(res.data).toEqual([{ operation_id: 'op-1', occurrence_type_name: 'Cancro' }]);
  });

  it('syncs mipd markings and invalidates operations and overview cache on success', async () => {
    mockRpc.mockResolvedValueOnce({
      data: [{ markingId: 'm-1', operationId: 'op-1' }],
      error: null,
    });

    const payload = {
      deviceId: 'desktop-web-1',
      markings: [
        {
          localMarkingId: 'local-1',
          plantId: 'plant-1',
          occurrenceTypeId: 'occ-1',
          plantParts: ['LEAF' as const],
          observedAt: '2026-11-12T10:00:00Z',
        },
      ],
    };

    const res = await service.syncMipdMarkings(payload);

    expect(mockRpc).toHaveBeenCalledWith('sync_mipd_markings', {
      p_payload: payload,
    });
    expect(mockRequestCache.invalidate).toHaveBeenCalled();
    expect(res.data?.markings).toEqual([{ markingId: 'm-1', operationId: 'op-1' }]);
  });

  it('uploads photo to bucket under user path with upsert', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123' } },
    });
    mockUpload.mockResolvedValueOnce({ error: null });

    const file = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });
    const res = await service.uploadPhoto(file, 'mark-uuid', 'desktop-web');

    expect(res.error).toBeNull();
    expect(res.path).toBe('user-123/desktop-web/mark-uuid.jpg');
  });

  it('creates signed photo URL on demand', async () => {
    mockCreateSignedUrl.mockResolvedValueOnce({
      data: { signedUrl: 'https://storage/signed-photo' },
      error: null,
    });

    const res = await service.createSignedPhotoUrl('some/path.jpg', 300);

    expect(res.signedUrl).toBe('https://storage/signed-photo');
    expect(res.error).toBeNull();
  });

  it('loads plants without limit or dead/non-existent filters', async () => {
    const mockOrder = vi.fn().mockResolvedValueOnce({
      data: [
        {
          id: 'plant-1',
          latitude: -22.37,
          longitude: -47.37,
          zone_id: 'z-1',
          zones: { name: 'Talhão 1' },
          varieties: { name: 'Lichia' },
        },
      ],
      error: null,
    });
    const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
    mockFrom.mockReturnValueOnce({ select: mockSelect });

    const res = await service.getPlants();
    expect(mockFrom).toHaveBeenCalledWith('plants');
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].zone_name).toBe('Talhão 1');
    expect(res.data?.[0].variety_name).toBe('Lichia');
  });
});
