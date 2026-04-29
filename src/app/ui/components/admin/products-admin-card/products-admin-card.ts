import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import type { Product } from '../../../../domain/models/product.model';

export interface ProductsAdminStats {
  total: number;
  active: number;
  inactive: number;
}

@Component({
  selector: 'app-products-admin-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './products-admin-card.html',
  styleUrls: ['./products-admin-card.scss'],
})
export class ProductsAdminCardComponent {
  @Input() public products: Product[] = [];
  @Input() public stats: ProductsAdminStats = { total: 0, active: 0, inactive: 0 };
  @Input() public isLoading = false;

  @Output() public refreshed = new EventEmitter<void>();
  @Output() public created = new EventEmitter<void>();
  @Output() public edited = new EventEmitter<Product>();
  @Output() public deleted = new EventEmitter<Product>();

  public trackByProductId(_: number, product: Product): string {
    return product.id;
  }
}
