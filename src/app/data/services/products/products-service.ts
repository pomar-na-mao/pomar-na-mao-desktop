import { Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
} from '../../../domain/models/product.model';
import { injectSupabase } from '../supabase';

export interface IProductsService {
  findAll(): Promise<PostgrestResponse<Product>>;
  insert(product: ProductInsert): Promise<PostgrestSingleResponse<Product>>;
  update(
    id: string,
    product: ProductUpdate,
  ): Promise<PostgrestSingleResponse<Product>>;
  delete(id: string): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService implements IProductsService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestResponse<Product>> {
    const [, response] = await Promise.all([
      this.supabase.auth.getUser(),
      this.supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true }),
    ]);

    return response;
  }

  public async insert(
    product: ProductInsert,
  ): Promise<PostgrestSingleResponse<Product>> {
    return await this.supabase
      .from('products')
      .insert([product])
      .select()
      .single();
  }

  public async update(
    id: string,
    product: ProductUpdate,
  ): Promise<PostgrestSingleResponse<Product>> {
    return await this.supabase
      .from('products')
      .update({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
  }

  public async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.from('products').delete().eq('id', id);
  }
}
