import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SprayingFlowService } from './spraying-flow-service';

describe('SprayingFlowService', () => {
  let service: SprayingFlowService;
  let mockFrom: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFrom = vi.fn();

    TestBed.configureTestingModule({
      providers: [SprayingFlowService],
    });

    service = TestBed.inject(SprayingFlowService);
    (service as unknown as { readSupabase: { from: typeof mockFrom } }).readSupabase = {
      from: mockFrom,
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSessions should query spraying_sessions ordered by started_at and created_at', async () => {
    const finalOrder = vi.fn().mockResolvedValue({ data: [{ id: 'session-1' }], error: null });
    const firstOrder = vi.fn().mockReturnValue({ order: finalOrder });
    const select = vi.fn().mockReturnValue({ order: firstOrder });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'spraying_sessions') {
        return { select };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const result = await service.getSessions();

    expect(mockFrom).toHaveBeenCalledWith('spraying_sessions');
    expect(select).toHaveBeenCalledWith('*');
    expect(firstOrder).toHaveBeenCalledWith('started_at', { ascending: false, nullsFirst: false });
    expect(finalOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result.data).toEqual([{ id: 'session-1' }]);
  });

  it('getSessionVisualization should aggregate and enrich session data', async () => {
    const session = { id: 'session-1', region: 'North', status: 'completed' };
    const routePoints = [
      { id: 'route-1', session_id: 'session-1', latitude: 1, longitude: 2, gps_timestamp: 10, accuracy: 1 },
    ];
    const sessionPlants = [
      { id: 'sp-1', session_id: 'session-1', plant_id: 'plant-1', distance_meters: 5.2, association_method: 'auto' },
    ];
    const sessionProducts = [
      { id: 'prod-rel-1', session_id: 'session-1', product_id: 'product-1', dose: 12, dose_unit: 'ml/L' },
      { id: 'prod-rel-2', session_id: 'session-1', product_id: 'product-2', dose: 8, dose_unit: 'ml/L' },
    ];
    const plants = [
      { id: 'plant-1', latitude: -10, longitude: -20, variety: 'Gala', region: 'North', is_dead: false, non_existent: false },
    ];
    const products = [
      { id: 'product-2', name: 'Zeta', active_ingredient: null, category: 'B', manufacturer: null },
      { id: 'product-1', name: 'Alpha', active_ingredient: 'Copper', category: 'A', manufacturer: 'ACME' },
    ];

    mockFrom.mockImplementation((table: string) => {
      if (table === 'spraying_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: session, error: null }),
            }),
          }),
        };
      }

      if (table === 'spraying_route_points') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: routePoints, error: null }),
            }),
          }),
        };
      }

      if (table === 'spraying_plants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: sessionPlants, error: null }),
            }),
          }),
        };
      }

      if (table === 'spraying_products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: sessionProducts, error: null }),
          }),
        };
      }

      if (table === 'plants') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: plants, error: null }),
          }),
        };
      }

      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: products, error: null }),
          }),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    const result = await service.getSessionVisualization('session-1');

    expect(result.error).toBeNull();
    expect(result.data?.session).toEqual(session);
    expect(result.data?.routePoints).toEqual(routePoints);
    expect(result.data?.plants).toEqual([
      {
        id: 'sp-1',
        session_id: 'session-1',
        plant_id: 'plant-1',
        distance_meters: 5.2,
        association_method: 'auto',
        latitude: -10,
        longitude: -20,
        variety: 'Gala',
        region: 'North',
        is_dead: false,
        non_existent: false,
      },
    ]);
    expect(result.data?.products.map((item) => item.name)).toEqual(['Alpha', 'Zeta']);
  });

  it('getSessionVisualization should return error when any query fails', async () => {
    const queryError = new Error('failed');

    mockFrom.mockImplementation((table: string) => {
      if (table === 'spraying_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: queryError }),
            }),
          }),
        };
      }

      if (table === 'spraying_route_points' || table === 'spraying_plants') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }

      if (table === 'spraying_products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }

      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      };
    });

    const result = await service.getSessionVisualization('session-1');

    expect(result.data).toBeNull();
    expect(result.error).toBe(queryError);
  });
});
