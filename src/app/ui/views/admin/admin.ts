import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminViewModel } from '../../view-models/admin/admin.view-model';
import { VarietiesViewModel } from '../../view-models/varieties/varieties.view-model';
import { RegionsViewModel } from '../../view-models/regions/regions.view-model';
import { ProductsAdminCard } from '../../components/admin/products-admin-card/products-admin-card';
import { ProductFormModal } from '../../components/admin/product-form-modal/product-form-modal';
import { DeleteProductModal } from '../../components/admin/delete-product-modal/delete-product-modal';
import { DeleteVarietyModal } from '../../components/admin/delete-variety-modal/delete-variety-modal';
import { VarietiesAdminCard } from '../../components/admin/varieties-admin-card/varieties-admin-card';
import { VarietyFormModal } from '../../components/admin/variety-form-modal/variety-form-modal';
import { RegionsAdminCard } from '../../components/admin/regions-admin-card/regions-admin-card';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    ProductsAdminCard,
    ProductFormModal,
    DeleteProductModal,
    VarietiesAdminCard,
    VarietyFormModal,
    DeleteVarietyModal,
    RegionsAdminCard
  ],
  templateUrl: './admin.html',
})
export class Admin implements OnInit {
  public productsViewModel = inject(AdminViewModel);
  public varietiesViewModel = inject(VarietiesViewModel);
  public regionsViewModel = inject(RegionsViewModel);

  activeTab = 'products';

  tabs = [
    { id: 'products', label: 'Produtos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { id: 'varieties', label: 'Variedades', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { id: 'regions', label: 'Zonas', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  ngOnInit(): void {
    this.productsViewModel.loadProducts();
    this.varietiesViewModel.loadVarieties();
    this.regionsViewModel.loadRegions();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }
}
