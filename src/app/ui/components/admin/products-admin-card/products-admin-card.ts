import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../../../domain/models/product.model';
import { ProductsAdminStats } from '../../../view-models/admin/admin.view-model';

@Component({
  selector: 'app-products-admin-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5 transition-colors">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-colors">Administração</p>
          <h2 class="mt-1 text-lg font-bold text-slate-800 dark:text-white transition-colors">Catálogo de Produtos</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">Gerencie os insumos e defensivos agrícolas disponíveis no sistema.</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 shadow-sm"
            title="Atualizar lista"
            (click)="refreshed.emit()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-10 px-4 items-center gap-2 rounded-xl bg-emerald-600 text-white font-bold text-sm transition-all hover:bg-emerald-700 shadow-sm active:scale-95"
            (click)="created.emit()"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </button>
        </div>
      </div>

      @if (isLoading) {
        <div class="flex flex-1 items-center justify-center py-16">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-emerald-100 dark:border-emerald-500/10 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500">Carregando catálogo...</p>
          </div>
        </div>
      } @else if (products.length === 0) {
        <div class="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Nenhum produto encontrado</h3>
          <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Você ainda não possui produtos cadastrados. Comece adicionando o primeiro.</p>
          <button 
            (click)="created.emit()"
            class="mt-6 text-emerald-600 dark:text-emerald-400 font-bold hover:underline transition-colors"
          >
            Cadastrar meu primeiro produto
          </button>
        </div>
      } @else {
        <div class="flex flex-1 flex-col gap-6 p-6">
          <!-- Quick Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total de Itens</p>
              <strong class="mt-1 block text-3xl font-black text-slate-800 dark:text-white">{{ stats.total }}</strong>
            </div>
            <div class="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-500/5 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Ativos</p>
              <strong class="mt-1 block text-3xl font-black text-emerald-700 dark:text-emerald-400">{{ stats.active }}</strong>
            </div>
            <div class="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 transition-all hover:shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Inativos</p>
              <strong class="mt-1 block text-3xl font-black text-slate-400 dark:text-slate-600">{{ stats.inactive }}</strong>
            </div>
          </div>

          <!-- Table Section -->
          <div class="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden flex-1 flex flex-col transition-colors">
            <div class="overflow-auto flex-1">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 transition-colors">
                    <th class="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Nome do Produto</th>
                    <th class="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Categoria</th>
                    <th class="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ingrediente Ativo</th>
                    <th class="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                    <th class="py-4 px-6 w-20"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                  @for (product of products; track product.id) {
                    <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td class="py-4 px-6">
                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{{ product.name }}</span>
                      </td>
                      <td class="py-4 px-6">
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700 transition-colors">{{ product.category || 'N/A' }}</span>
                      </td>
                      <td class="py-4 px-6">
                        <span class="text-xs text-slate-600 dark:text-slate-400 italic font-medium transition-colors">{{ product.active_ingredient || '-' }}</span>
                      </td>
                      <td class="py-4 px-6 text-center">
                        <span 
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border transition-colors"
                          [ngClass]="product.is_active !== false 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'"
                        >
                          <span class="w-1.5 h-1.5 rounded-full transition-colors" [ngClass]="product.is_active !== false ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'"></span>
                          {{ product.is_active !== false ? 'Ativo' : 'Inativo' }}
                        </span>
                      </td>
                      <td class="py-4 px-6 text-right">
                        <div class="flex items-center justify-end gap-1">
                          <button 
                            (click)="edited.emit(product)"
                            class="p-2 text-blue-600 hover:opacity-70 transition-all"
                            title="Editar"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            (click)="deleted.emit(product)"
                            class="p-2 text-rose-600 hover:opacity-70 transition-all"
                            title="Excluir"
                          >
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            
            <div class="bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-6 py-3 transition-colors">
              <p class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">
                Exibindo {{ products.length }} produto(s)
              </p>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class ProductsAdminCard {
  @Input() products: Product[] = [];
  @Input() stats: ProductsAdminStats = { total: 0, active: 0, inactive: 0 };
  @Input() isLoading = false;

  @Output() refreshed = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  @Output() edited = new EventEmitter<Product>();
  @Output() deleted = new EventEmitter<Product>();
}
