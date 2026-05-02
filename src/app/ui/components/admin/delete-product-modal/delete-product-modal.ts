import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Product } from '../../../../domain/models/product.model';

@Component({
  selector: 'app-delete-product-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      (click)="onBackdropClick($event)"
      id="delete-backdrop"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100"
        (click)="$event.stopPropagation()"
      >
        <div class="p-8 text-center">
          <!-- Icon -->
          <div class="mx-auto w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 mb-6">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <h2 class="text-2xl font-black text-slate-800 tracking-tight">Excluir Produto?</h2>
          <p class="text-slate-500 mt-3 leading-relaxed">
            Tem certeza que deseja remover o produto <strong class="text-slate-800 font-black">"{{ product?.name }}"</strong>? Esta ação não poderá ser desfeita.
          </p>

          <div class="mt-8 flex flex-col gap-3">
            <button 
              type="button"
              (click)="confirmed.emit()"
              [disabled]="isDeleting"
              class="w-full py-3.5 rounded-2xl bg-rose-600 text-white font-black text-sm transition-all hover:bg-rose-700 shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              @if (isDeleting) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Excluindo...
              } @else {
                Sim, excluir definitivamente
              }
            </button>
            <button 
              type="button"
              (click)="close()"
              [disabled]="isDeleting"
              class="w-full py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
            >
              Não, manter produto
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DeleteProductModal {
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
    if ((event.target as HTMLElement).id === 'delete-backdrop') {
      this.close();
    }
  }
}
