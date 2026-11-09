import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import {
  DEFAULT_STOCK_TYPES,
  type StockCreate,
  type StockDraft,
  type StockItem,
  type StockUpdate,
} from '../../../domain/models/stock.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export const STOCK_PHOTOS_BUCKET = 'stock-item-photos';
export const STOCK_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const STOCK_PHOTO_SIGNED_URL_TTL_SECONDS = 300;

export interface StockPhotoResult {
  objectPath: string | null;
  error: Error | null;
}

export interface StockSignedPhotoResult {
  signedUrl: string | null;
  error: Error | null;
}

export interface IStockService {
  findAll(): Promise<PostgrestResponse<StockItem>>;
  create(payload: StockDraft): Promise<PostgrestSingleResponse<StockItem>>;
  update(
    id: string,
    payload: StockDraft,
  ): Promise<PostgrestSingleResponse<StockItem>>;
  deleteMany(ids: string[]): Promise<PostgrestSingleResponse<null>>;
  fetchEnumValues(): Promise<string[]>;
  addEnumValue(value: string): Promise<{ error: Error | null }>;
  uploadPhoto(stockId: string, file: File): Promise<StockPhotoResult>;
  createSignedPhotoUrl(
    objectPath: string | null,
  ): Promise<StockSignedPhotoResult>;
  deletePhoto(objectPath: string | null): Promise<{ error: Error | null }>;
}

@Injectable({ providedIn: 'root' })
export class StockService implements IStockService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<StockItem>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'stock.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('stocks')
          .select('*', { count: 'exact' })
          .order('updated_at', { ascending: false }),
    ) as Promise<PostgrestResponse<StockItem>>;
  }

  public async create(
    payload: StockDraft,
  ): Promise<PostgrestSingleResponse<StockItem>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: StockCreate = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const response = (await this.supabase
      .from('stocks')
      .insert([persistedPayload])
      .select('*')
      .single()) as PostgrestSingleResponse<StockItem>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async update(
    id: string,
    payload: StockDraft,
  ): Promise<PostgrestSingleResponse<StockItem>> {
    const persistedPayload: StockUpdate = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    const response = (await this.supabase
      .from('stocks')
      .update(persistedPayload)
      .eq('id', id)
      .select('*')
      .single()) as PostgrestSingleResponse<StockItem>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async deleteMany(
    ids: string[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('stocks')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async fetchEnumValues(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_stock_type_enum_values',
      );
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item: { value: string } | string) =>
          typeof item === 'string' ? item : item.value,
        );
      }
    } catch {
      // Fallback para os tipos pré-configurados
    }
    return [...DEFAULT_STOCK_TYPES];
  }

  public async addEnumValue(value: string): Promise<{ error: Error | null }> {
    const upperValue = value.trim().toUpperCase();
    try {
      const { error } = await this.supabase.rpc('add_stock_type_enum_value', {
        new_value: upperValue,
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  public async uploadPhoto(
    stockId: string,
    file: File,
  ): Promise<StockPhotoResult> {
    if (!file.type.startsWith('image/')) {
      return {
        objectPath: null,
        error: new Error('Selecione um arquivo de imagem válido.'),
      };
    }
    if (file.size > STOCK_PHOTO_MAX_SIZE_BYTES) {
      return {
        objectPath: null,
        error: new Error('A imagem deve ter no máximo 5 MB.'),
      };
    }

    const extension = this.fileExtension(file);
    const objectPath = `${stockId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await this.supabase.storage
      .from(STOCK_PHOTOS_BUCKET)
      .upload(objectPath, file, {
        contentType: file.type,
        upsert: false,
      });

    return {
      objectPath: error ? null : objectPath,
      error: error ? new Error(error.message) : null,
    };
  }

  public async createSignedPhotoUrl(
    objectPath: string | null,
  ): Promise<StockSignedPhotoResult> {
    if (!objectPath) return { signedUrl: null, error: null };

    const { data, error } = await this.supabase.storage
      .from(STOCK_PHOTOS_BUCKET)
      .createSignedUrl(objectPath, STOCK_PHOTO_SIGNED_URL_TTL_SECONDS);

    return {
      signedUrl: data?.signedUrl ?? null,
      error: error ? new Error(error.message) : null,
    };
  }

  public async deletePhoto(
    objectPath: string | null,
  ): Promise<{ error: Error | null }> {
    if (!objectPath) return { error: null };
    const { error } = await this.supabase.storage
      .from(STOCK_PHOTOS_BUCKET)
      .remove([objectPath]);
    return { error: error ? new Error(error.message) : null };
  }

  private invalidateReadsWhenSuccessful(error: unknown): void {
    if (error) return;
    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.referenceData,
    ]);
  }

  private fileExtension(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && /^[a-z0-9]+$/.test(extension)) return extension;
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/webp') return 'webp';
    return 'jpg';
  }
}
