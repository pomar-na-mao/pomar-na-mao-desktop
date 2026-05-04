import { inject, Injectable, signal } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  Product,
  ProductInsert,
  ProductUpdate,
} from '../../../domain/models/product.model';
import { ProductsService } from '../../services/products/products-service';

@Injectable({
  providedIn: 'root',
})
export class ProductsRepository {
  private productsService = inject(ProductsService);

  public products = signal<Product[]>([]);

  public async findAll(): Promise<{ error: PostgrestError | null }> {
    const { data, error } = await this.productsService.findAll();

    if (!error && data) {
      this.products.set(this.sortProducts(data));
    }

    return { error };
  }

  public async insert(
    product: ProductInsert,
  ): Promise<{ data: Product | null; error: PostgrestError | null }> {
    const { data, error } = await this.productsService.insert(product);
    if (!error && data) {
      this.products.update((current) => this.sortProducts([...current, data]));
    }

    return { data, error };
  }

  public async update(
    id: string,
    product: ProductUpdate,
  ): Promise<{ data: Product | null; error: PostgrestError | null }> {
    const { data, error } = await this.productsService.update(id, product);
    if (!error && data) {
      this.products.update((current) =>
        this.sortProducts(
          current.map((item) => (item.id === id ? data : item)),
        ),
      );
    }

    return { data, error };
  }

  public async delete(id: string): Promise<{ error: PostgrestError | null }> {
    const { error } = await this.productsService.delete(id);
    if (!error) {
      this.products.update((current) =>
        current.filter((item) => item.id !== id),
      );
    }

    return { error };
  }

  private sortProducts(products: Product[]): Product[] {
    return [...products].sort((left, right) =>
      left.name.localeCompare(right.name, 'pt-BR'),
    );
  }
}
