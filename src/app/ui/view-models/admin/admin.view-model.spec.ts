import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminViewModel } from './admin.view-model';
import { ProductsRepository } from '../../../data/repositories/products/products-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { Product } from '../../../domain/models/product.model';

describe('AdminViewModel', () => {
  let viewModel: AdminViewModel;

  const productsSignal = signal<Product[]>([]);
  const mockProductsRepository = {
    products: productsSignal,
    findAll: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    productsSignal.set([]);

    TestBed.configureTestingModule({
      providers: [
        AdminViewModel,
        { provide: ProductsRepository, useValue: mockProductsRepository },
        { provide: MessageService, useValue: mockMessageService },
      ],
    });

    viewModel = TestBed.inject(AdminViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  describe('Stats', () => {
    it('should calculate stats correctly', () => {
      productsSignal.set([
        { id: '1', name: 'P1', is_active: true } as Product,
        { id: '2', name: 'P2', is_active: false } as Product,
        { id: '3', name: 'P3', is_active: true } as Product,
      ]);

      expect(viewModel.stats()).toEqual({
        total: 3,
        active: 2,
        inactive: 1,
      });
    });

    it('should return zeros when no products', () => {
      expect(viewModel.stats()).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
      });
    });
  });

  describe('Load Products', () => {
    it('should call repository.findAll and update loading state', async () => {
      mockProductsRepository.findAll.mockResolvedValue({ error: null });
      
      const loadPromise = viewModel.loadProducts();
      expect(viewModel.isLoading()).toBe(true);
      
      await loadPromise;
      expect(mockProductsRepository.findAll).toHaveBeenCalled();
      expect(viewModel.isLoading()).toBe(false);
    });

    it('should show error message if findAll fails', async () => {
      mockProductsRepository.findAll.mockResolvedValue({ error: { message: 'error' } });
      
      await viewModel.loadProducts();
      expect(mockMessageService.error).toHaveBeenCalledWith('Erro ao carregar produtos. Verifique sua conexão.');
    });
  });

  describe('Modal Management', () => {
    it('should open create modal', () => {
      viewModel.openCreateModal();
      expect(viewModel.isModalOpen()).toBe(true);
      expect(viewModel.editingProduct()).toBeNull();
    });

    it('should open edit modal with product', () => {
      const product = { id: '1', name: 'Test' } as Product;
      viewModel.openEditModal(product);
      expect(viewModel.isModalOpen()).toBe(true);
      expect(viewModel.editingProduct()).toBe(product);
    });

    it('should close modal', () => {
      viewModel.openCreateModal();
      viewModel.closeModal();
      expect(viewModel.isModalOpen()).toBe(false);
      expect(viewModel.editingProduct()).toBeNull();
    });
  });

  describe('Save Product', () => {
    it('should insert new product when no product is being edited', async () => {
      mockProductsRepository.insert.mockResolvedValue({ error: null });
      const productData = { name: 'New Product' };

      await viewModel.saveProduct(productData);

      expect(mockProductsRepository.insert).toHaveBeenCalledWith(productData);
      expect(mockMessageService.success).toHaveBeenCalledWith('Produto cadastrado com sucesso!');
      expect(viewModel.isModalOpen()).toBe(false);
    });

    it('should update existing product when editing', async () => {
      const existingProduct = { id: '1', name: 'Old Name' } as Product;
      viewModel.openEditModal(existingProduct);
      
      mockProductsRepository.update.mockResolvedValue({ error: null });
      const updatedData = { name: 'New Name' };

      await viewModel.saveProduct(updatedData);

      expect(mockProductsRepository.update).toHaveBeenCalledWith('1', updatedData);
      expect(mockMessageService.success).toHaveBeenCalledWith('Produto atualizado com sucesso!');
      expect(viewModel.isModalOpen()).toBe(false);
    });

    it('should show error if insert fails', async () => {
      mockProductsRepository.insert.mockResolvedValue({ error: { message: 'fail' } });
      await viewModel.saveProduct({ name: 'Fail' });
      expect(mockMessageService.error).toHaveBeenCalledWith('Erro ao cadastrar produto.');
    });

    it('should show error if update fails', async () => {
      viewModel.openEditModal({ id: '1' } as Product);
      mockProductsRepository.update.mockResolvedValue({ error: { message: 'fail' } });
      await viewModel.saveProduct({ name: 'Fail' });
      expect(mockMessageService.error).toHaveBeenCalledWith('Erro ao atualizar produto.');
    });
  });

  describe('Delete Product', () => {
    it('should call delete and show success', async () => {
      const product = { id: '1', name: 'Delete Me' } as Product;
      viewModel.openDeleteModal(product);
      
      mockProductsRepository.delete.mockResolvedValue({ error: null });

      await viewModel.deleteProduct();

      expect(mockProductsRepository.delete).toHaveBeenCalledWith('1');
      expect(mockMessageService.success).toHaveBeenCalledWith('Produto excluído com sucesso!');
      expect(viewModel.deletingProduct()).toBeNull();
    });

    it('should show error if delete fails', async () => {
      const product = { id: '1' } as Product;
      viewModel.openDeleteModal(product);
      mockProductsRepository.delete.mockResolvedValue({ error: { message: 'fail' } });

      await viewModel.deleteProduct();
      expect(mockMessageService.error).toHaveBeenCalledWith('Erro ao excluir produto.');
    });

    it('should do nothing if no product selected for deletion', async () => {
      await viewModel.deleteProduct();
      expect(mockProductsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
