import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminViewModel } from '../../view-models/admin/admin.view-model';
import { ProductsAdminCard } from '../../components/admin/products-admin-card/products-admin-card';
import { ProductFormModal } from '../../components/admin/product-form-modal/product-form-modal';
import { DeleteProductModal } from '../../components/admin/delete-product-modal/delete-product-modal';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ProductsAdminCard,
    ProductFormModal,
    DeleteProductModal
  ],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  public viewModel = inject(AdminViewModel);

  public adminModules = [
    {
      id: 'products',
      label: 'Produtos',
      description: 'Gerencie o catálogo de produtos e insumos do sistema.',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', // Box icon
      active: true
    },
    {
      id: 'varieties',
      label: 'Variedades',
      description: 'Configuração de tipos de cultivares e variedades.',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', // Book icon
      active: false
    },
    {
      id: 'orchards',
      label: 'Pomares',
      description: 'Gestão de áreas, talhões e estrutura física.',
      icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Globe/Map icon
      active: false
    }
  ];

  ngOnInit(): void {
    this.viewModel.loadProducts();
  }
}
