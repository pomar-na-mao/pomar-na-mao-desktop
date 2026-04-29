import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import type { Product } from '../../../../domain/models/product.model';
import { AppButton } from '../../../../shared/components';

@Component({
  selector: 'app-delete-product-modal',
  imports: [CommonModule, TranslateModule, AppButton],
  templateUrl: './delete-product-modal.html',
  styleUrls: ['./delete-product-modal.scss'],
})
export class DeleteProductModalComponent {
  @Input() public product: Product | null = null;
  @Input() public isDeleting = false;
  @Output() public closed = new EventEmitter<void>();
  @Output() public confirmed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.close();
  }

  public close(): void {
    if (this.isDeleting) return;
    this.closed.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }
}
