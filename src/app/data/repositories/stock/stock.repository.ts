import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import {
  DEFAULT_STOCK_TYPES,
  type StockDraft,
  type StockItem,
} from '../../../domain/models/stock.model';
import { StockService } from '../../services/stock/stock.service';

export interface StockMutationResult {
  data: StockItem | null;
  error: PostgrestError | Error | null;
}

@Injectable({ providedIn: 'root' })
export class StockRepository {
  private stockService = inject(StockService);

  public stockItems = signal<StockItem[]>([]);
  public availableTypes = signal<string[]>([...DEFAULT_STOCK_TYPES]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.stockService.findAll();
    if (!error && data) {
      this.stockItems.set(this.sort(data));
    }
    return { error };
  }

  public async loadEnumValues(): Promise<void> {
    const values = await this.stockService.fetchEnumValues();
    if (values && values.length > 0) {
      // Mescla com os tipos padrão caso algum falte
      const merged = Array.from(new Set([...DEFAULT_STOCK_TYPES, ...values]));
      this.availableTypes.set(merged);
    }
  }

  public async create(
    payload: StockDraft,
    photoFile: File | null = null,
  ): Promise<StockMutationResult> {
    const created = await this.stockService.create(payload);
    if (created.error || !created.data) {
      return { data: created.data ?? null, error: created.error };
    }

    let savedItem = created.data;
    if (photoFile) {
      const upload = await this.stockService.uploadPhoto(created.data.id, photoFile);
      if (upload.error || !upload.objectPath) {
        await this.stockService.deleteMany([created.data.id]);
        return { data: null, error: upload.error };
      }

      const updated = await this.stockService.update(created.data.id, {
        ...payload,
        photo_object_path: upload.objectPath,
      });
      if (updated.error || !updated.data) {
        await this.stockService.deletePhoto(upload.objectPath);
        await this.stockService.deleteMany([created.data.id]);
        return { data: null, error: updated.error };
      }
      savedItem = updated.data;
    }

    this.stockItems.update((items) => this.sort([...items, savedItem]));
    return { data: savedItem, error: null };
  }

  public async update(
    id: string,
    payload: StockDraft,
    photoFile: File | null = null,
    previousPhotoPath: string | null = null,
  ): Promise<StockMutationResult> {
    let nextPayload = payload;
    let uploadedPath: string | null = null;

    if (photoFile) {
      const upload = await this.stockService.uploadPhoto(id, photoFile);
      if (upload.error || !upload.objectPath) {
        return { data: null, error: upload.error };
      }
      uploadedPath = upload.objectPath;
      nextPayload = { ...payload, photo_object_path: uploadedPath };
    }

    const { data, error } = await this.stockService.update(id, nextPayload);
    if (error || !data) {
      if (uploadedPath) await this.stockService.deletePhoto(uploadedPath);
      return { data: data ?? null, error };
    }

    if (uploadedPath && previousPhotoPath !== uploadedPath) {
      await this.stockService.deletePhoto(previousPhotoPath);
    }

    if (data) {
      this.stockItems.update((items) =>
        this.sort(items.map((item) => (item.id === id ? data : item))),
      );
    }
    return { data, error: null };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.stockService.deleteMany(ids);
    if (!error) {
      const photoPaths = this.stockItems()
        .filter((item) => ids.includes(item.id))
        .map((item) => item.photo_object_path)
        .filter((path): path is string => Boolean(path));
      const deletedIds = new Set(ids);
      this.stockItems.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
      await Promise.all(
        photoPaths.map((path) => this.stockService.deletePhoto(path)),
      );
    }
    return { error };
  }

  public async addEnumValue(
    newValue: string,
  ): Promise<{ error: Error | null }> {
    const upper = newValue.trim().toUpperCase();
    const result = await this.stockService.addEnumValue(upper);
    if (!result.error) {
      this.availableTypes.update((types) =>
        types.includes(upper) ? types : [...types, upper],
      );
    }
    return result;
  }

  public async createSignedPhotoUrl(
    objectPath: string | null,
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    return this.stockService.createSignedPhotoUrl(objectPath);
  }

  private sort(items: StockItem[]): StockItem[] {
    return [...items].sort(
      (left, right) =>
        right.updated_at.localeCompare(left.updated_at) ||
        left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
