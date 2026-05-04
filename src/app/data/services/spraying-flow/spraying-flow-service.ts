import { Injectable } from '@angular/core';
import { createClient, type PostgrestSingleResponse } from '@supabase/supabase-js';
import { APP_CONFIG } from '../../../../environments/environment';
import type { Plant } from '../../../domain/models/plant-data.model';
import type {
  ProductCatalogItem,
  SprayingRoutePoint,
  SprayingSession,
  SprayingSessionPlantRow,
  SprayingSessionProductRow,
  SprayingSessionVisualization,
  SprayingPlant,
  SprayingProduct,
} from '../../../domain/models/spraying-session.model';

@Injectable({
  providedIn: 'root',
})
export class SprayingFlowService {
  private readSupabase = createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  public async getSessions(): Promise<PostgrestSingleResponse<SprayingSession[]>> {
    return await this.readSupabase
      .from('spraying_sessions')
      .select('*')
      .order('started_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
  }

  public async getSessionVisualization(
    sessionId: string
  ): Promise<{ data: SprayingSessionVisualization | null; error: unknown }> {
    try {
      const [
        sessionResponse,
        routePointsResponse,
        sessionPlantsResponse,
        sessionProductsResponse,
      ] = await Promise.all([
        this.readSupabase.from('spraying_sessions').select('*').eq('id', sessionId).single(),
        this.readSupabase
          .from('spraying_route_points')
          .select('*')
          .eq('session_id', sessionId)
          .order('gps_timestamp', { ascending: true, nullsFirst: false }),
        this.readSupabase
          .from('spraying_plants')
          .select('id, session_id, plant_id, distance_meters, association_method')
          .eq('session_id', sessionId)
          .order('distance_meters', { ascending: true, nullsFirst: false }),
        this.readSupabase
          .from('spraying_products')
          .select('id, session_id, product_id, dose, dose_unit')
          .eq('session_id', sessionId),
      ]);

      if (sessionResponse.error) throw sessionResponse.error;
      if (routePointsResponse.error) throw routePointsResponse.error;
      if (sessionPlantsResponse.error) throw sessionPlantsResponse.error;
      if (sessionProductsResponse.error) throw sessionProductsResponse.error;

      const sessionPlantRows = (sessionPlantsResponse.data ?? []) as SprayingSessionPlantRow[];
      const sessionProductRows = (sessionProductsResponse.data ?? []) as SprayingSessionProductRow[];

      const plantIds = sessionPlantRows.map((item) => item.plant_id);
      const productIds = sessionProductRows.map((item) => item.product_id);

      const [plantsResponse, productsResponse] = await Promise.all([
        plantIds.length > 0
          ? this.readSupabase
              .from('plants')
              .select('id, latitude, longitude, variety, region, is_dead, non_existent')
              .in('id', plantIds)
          : Promise.resolve({ data: [], error: null }),
        productIds.length > 0
          ? this.readSupabase
              .from('products')
              .select('id, name, active_ingredient, category, manufacturer')
              .in('id', productIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (plantsResponse.error) throw plantsResponse.error;
      if (productsResponse.error) throw productsResponse.error;

      const plantsById = new Map(
        ((plantsResponse.data ?? []) as Pick<
          Plant,
          'id' | 'latitude' | 'longitude' | 'variety' | 'region' | 'is_dead' | 'non_existent'
        >[]).map((plant) => [plant.id, plant])
      );
      const productsById = new Map(
        ((productsResponse.data ?? []) as ProductCatalogItem[]).map((product) => [product.id, product])
      );

      const plants = sessionPlantRows.reduce<SprayingPlant[]>((acc, item) => {
        const plant = plantsById.get(item.plant_id);
        if (!plant) return acc;

        acc.push({
          ...item,
          latitude: plant.latitude,
          longitude: plant.longitude,
          variety: plant.variety ?? null,
          region: plant.region ?? null,
          is_dead: plant.is_dead ?? null,
          non_existent: plant.non_existent ?? null,
        });

        return acc;
      }, []);

      const products: SprayingProduct[] = sessionProductRows
        .map((item) => {
          const product = productsById.get(item.product_id);
          return {
            ...item,
            name: product?.name ?? null,
            active_ingredient: product?.active_ingredient ?? null,
            category: product?.category ?? null,
            manufacturer: product?.manufacturer ?? null,
          };
        })
        .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));

      return {
        data: {
          session: sessionResponse.data,
          routePoints: (routePointsResponse.data ?? []) as SprayingRoutePoint[],
          plants,
          products,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }
}
