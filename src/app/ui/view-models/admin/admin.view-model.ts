import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductsRepository } from '../../../data/repositories/products/products-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { Product } from '../../../domain/models/product.model';

export interface ProductsAdminStats {
  total: number;
  active: number;
  inactive: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminViewModel {
  private productsRepository = inject(ProductsRepository);
  private messageService = inject(MessageService);

  // Signals
  public products = this.productsRepository.products;
  public isLoading = signal<boolean>(false);
  public isSaving = signal<boolean>(false);
  public isDeleting = signal<boolean>(false);
  public isModalOpen = signal<boolean>(false);
  public editingProduct = signal<Product | null>(null);
  public deletingProduct = signal<Product | null>(null);

  // Computed
  public stats = computed<ProductsAdminStats>(() => {
    const allProducts = this.products();
    return {
      total: allProducts.length,
      active: allProducts.filter(p => p.is_active !== false).length,
      inactive: allProducts.filter(p => p.is_active === false).length,
    };
  });

  public async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { error } = await this.productsRepository.findAll();
      if (error) {
        this.messageService.error('Erro ao carregar produtos. Verifique sua conexão.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreateModal(): void {
    this.editingProduct.set(null);
    this.isModalOpen.set(true);
  }

  public openEditModal(product: Product): void {
    this.editingProduct.set(product);
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProduct.set(null);
  }

  public openDeleteModal(product: Product): void {
    this.deletingProduct.set(product);
  }

  public closeDeleteModal(): void {
    this.deletingProduct.set(null);
  }

  public async saveProduct(productData: Partial<Product>): Promise<void> {
    this.isSaving.set(true);
    try {
      const current = this.editingProduct();
      if (current?.id) {
        const { error } = await this.productsRepository.update(current.id, productData);
        if (error) {
          this.messageService.error('Erro ao atualizar produto.');
          return;
        }
        this.messageService.success('Produto atualizado com sucesso!');
      } else {
        const { error } = await this.productsRepository.insert(productData as any);
        if (error) {
          this.messageService.error('Erro ao cadastrar produto.');
          return;
        }
        this.messageService.success('Produto cadastrado com sucesso!');
      }
      this.closeModal();
    } finally {
      this.isSaving.set(false);
    }
  }

  public async deleteProduct(): Promise<void> {
    const product = this.deletingProduct();
    if (!product) return;

    this.isDeleting.set(true);
    try {
      const { error } = await this.productsRepository.delete(product.id);
      if (error) {
        this.messageService.error('Erro ao excluir produto.');
        return;
      }
      this.messageService.success('Produto excluído com sucesso!');
      this.closeDeleteModal();
    } finally {
      this.isDeleting.set(false);
    }
  }
}
