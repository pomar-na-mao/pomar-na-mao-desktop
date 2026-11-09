import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import {
  STOCK_PHOTOS_BUCKET,
  STOCK_PHOTO_SIGNED_URL_TTL_SECONDS,
  StockService,
} from './stock.service';

describe('StockService photos', () => {
  let service: StockService;
  const upload = vi.fn();
  const createSignedUrl = vi.fn();
  const remove = vi.fn();
  const storageFrom = vi.fn(() => ({ upload, createSignedUrl, remove }));

  beforeEach(() => {
    vi.clearAllMocks();
    const client = {
      storage: { from: storageFrom },
    } as unknown as SupabaseClient;

    TestBed.configureTestingModule({
      providers: [
        StockService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => client },
        },
        {
          provide: SupabaseRequestCacheService,
          useValue: { read: vi.fn(), invalidate: vi.fn() },
        },
      ],
    });
    service = TestBed.inject(StockService);
  });

  it('uploads an image under the stock item id', async () => {
    upload.mockResolvedValue({ data: {}, error: null });
    const file = new File(['image'], 'produto.png', { type: 'image/png' });

    const result = await service.uploadPhoto('stock-1', file);

    expect(result.error).toBeNull();
    expect(result.objectPath).toMatch(/^stock-1\/[\w-]+\.png$/);
    expect(storageFrom).toHaveBeenCalledWith(STOCK_PHOTOS_BUCKET);
    expect(upload).toHaveBeenCalledWith(
      result.objectPath,
      file,
      expect.objectContaining({ contentType: 'image/png', upsert: false }),
    );
  });

  it('rejects non-image files before calling Storage', async () => {
    const file = new File(['text'], 'produto.txt', { type: 'text/plain' });

    const result = await service.uploadPhoto('stock-1', file);

    expect(result.objectPath).toBeNull();
    expect(result.error?.message).toContain('imagem');
    expect(storageFrom).not.toHaveBeenCalled();
  });

  it('creates a five-minute signed URL for a private photo', async () => {
    createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://signed.example/stock-photo' },
      error: null,
    });

    await expect(
      service.createSignedPhotoUrl('stock-1/photo.webp'),
    ).resolves.toEqual({
      signedUrl: 'https://signed.example/stock-photo',
      error: null,
    });
    expect(createSignedUrl).toHaveBeenCalledWith(
      'stock-1/photo.webp',
      STOCK_PHOTO_SIGNED_URL_TTL_SECONDS,
    );
  });

  it('removes the stored object by its persisted path', async () => {
    remove.mockResolvedValue({ data: [], error: null });

    await expect(service.deletePhoto('stock-1/photo.jpg')).resolves.toEqual({
      error: null,
    });
    expect(remove).toHaveBeenCalledWith(['stock-1/photo.jpg']);
  });
});
