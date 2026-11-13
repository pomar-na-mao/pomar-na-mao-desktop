import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { ActivityEntryService } from './activity-entry.service';

describe('ActivityEntryService', () => {
  const rpc = vi.fn();
  let service: ActivityEntryService;

  beforeEach(() => {
    rpc.mockReset();
    TestBed.configureTestingModule({
      providers: [
        ActivityEntryService,
        SupabaseRequestCacheService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => ({ rpc }) as unknown as SupabaseClient },
        },
      ],
    });
    service = TestBed.inject(ActivityEntryService);
  });

  it('uses sync_activity_entries with the mobile payload fields', async () => {
    rpc.mockResolvedValue({
      data: [{ local_id: 'local', field_operation_id: 'operation', entry_id: 'entry', inputs_count: 2, synced_at: '2026-11-12T12:00:00Z' }],
      error: null,
    });

    await service.create({
      geometryType: 'area',
      coordinates: [[-49.1, -23.4], [-49.2, -23.4], [-49.2, -23.5]],
      activity: ' Roçagem ',
      performedAt: '2026-11-12T12:00:00.000Z',
      responsible: ' João ',
      mixtureId: 'mixture-id',
      machineId: 'machine-id',
    });

    expect(rpc).toHaveBeenCalledWith('sync_activity_entries', {
      p_payload: expect.objectContaining({
        deviceId: expect.stringMatching(/^desktop-/),
        entries: [
          expect.objectContaining({
            localId: expect.any(String),
            geometryType: 'area',
            geometry: {
              type: 'Polygon',
              coordinates: [[[-49.1, -23.4], [-49.2, -23.4], [-49.2, -23.5], [-49.1, -23.4]]],
            },
            activity: 'Roçagem',
            performedAt: '2026-11-12T12:00:00.000Z',
            responsible: 'João',
            mixtureId: 'mixture-id',
            machineId: 'machine-id',
            inputs: [],
          }),
        ],
      }),
    });
  });

  it('propagates RPC errors', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('RPC indisponível') });
    await expect(service.create({
      geometryType: 'route',
      coordinates: [[-49.1, -23.4], [-49.2, -23.5]],
      activity: 'Roçagem',
      performedAt: '2026-11-12T12:00:00.000Z',
      responsible: 'João',
    })).rejects.toThrow('RPC indisponível');
  });
});
