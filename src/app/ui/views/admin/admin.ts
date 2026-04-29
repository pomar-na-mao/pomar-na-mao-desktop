import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductsRepository } from '../../../data/repositories/products/products-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { Product } from '../../../domain/models/product.model';
import { DeleteProductModalComponent } from '../../components/admin/delete-product-modal/delete-product-modal';
import {
  ProductsAdminCardComponent,
  type ProductsAdminStats,
} from '../../components/admin/products-admin-card/products-admin-card';
import {
  ProductFormModalComponent,
  type ProductFormValue,
} from '../../components/admin/product-form-modal/product-form-modal';

@Component({
  selector: 'app-admin-products',
  imports: [
    CommonModule,
    TranslateModule,
    ProductsAdminCardComponent,
    ProductFormModalComponent,
    DeleteProductModalComponent,
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements OnInit {
  private productsRepository = inject(ProductsRepository);
  private messageService = inject(MessageService);

  public products = this.productsRepository.products;
  public isLoading = signal(true);
  public isSaving = signal(false);
  public isDeleting = signal(false);
  public isCreateModalOpen = signal(false);
  public editingProduct = signal<Product | null>(null);
  public deletingProduct = signal<Product | null>(null);
  public adminModules = [
    {
      icon: 'inventory_2',
      titleKey: 'PAGES.ADMIN.PRODUCTS.MODULE.PRODUCTS_TITLE',
      accentClass: 'admin-module--active',
    },
    { icon: 'science', titleKey: 'PAGES.ADMIN.PRODUCTS.MODULE.PLACEHOLDER_1' },
    {
      icon: 'agriculture',
      titleKey: 'PAGES.ADMIN.PRODUCTS.MODULE.PLACEHOLDER_2',
    },
    {
      icon: 'warehouse',
      titleKey: 'PAGES.ADMIN.PRODUCTS.MODULE.PLACEHOLDER_3',
    },
  ];

  public pageStats = computed<ProductsAdminStats>(() => ({
    total: this.products().length,
    active: this.products().filter((product) => product.is_active !== false)
      .length,
    inactive: this.products().filter((product) => product.is_active === false)
      .length,
  }));

  public async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  public async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const { error } = await this.productsRepository.findAll();
      if (error) {
        this.messageService.error('PAGES.ADMIN.PRODUCTS.TOAST.LOAD_ERROR');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public openNewProductModal(): void {
    this.editingProduct.set(null);
    this.isCreateModalOpen.set(true);
  }

  public openEditModal(product: Product): void {
    this.isCreateModalOpen.set(false);
    this.editingProduct.set(product);
  }

  public closeProductModal(): void {
    this.editingProduct.set(null);
    this.isCreateModalOpen.set(false);
  }

  public openDeleteModal(product: Product): void {
    this.deletingProduct.set(product);
  }

  public closeDeleteModal(): void {
    this.deletingProduct.set(null);
  }

  public async saveProduct(value: ProductFormValue): Promise<void> {
    this.isSaving.set(true);
    try {
      const currentProduct = this.editingProduct();

      if (currentProduct?.id) {
        const { error } = await this.productsRepository.update(
          currentProduct.id,
          value,
        );
        if (error) {
          this.messageService.error('PAGES.ADMIN.PRODUCTS.TOAST.UPDATE_ERROR');
          return;
        }

        this.messageService.success(
          'PAGES.ADMIN.PRODUCTS.TOAST.UPDATE_SUCCESS',
        );
      } else {
        const { error } = await this.productsRepository.insert(value);
        if (error) {
          this.messageService.error('PAGES.ADMIN.PRODUCTS.TOAST.CREATE_ERROR');
          return;
        }

        this.messageService.success(
          'PAGES.ADMIN.PRODUCTS.TOAST.CREATE_SUCCESS',
        );
      }

      this.closeProductModal();
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
        this.messageService.error('PAGES.ADMIN.PRODUCTS.TOAST.DELETE_ERROR');
        return;
      }

      this.messageService.success('PAGES.ADMIN.PRODUCTS.TOAST.DELETE_SUCCESS');
      this.closeDeleteModal();
    } finally {
      this.isDeleting.set(false);
    }
  }
}
