import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';

@Component({
  selector: 'app-operations-map-details-card',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (details()) {
      <div class="absolute bottom-4 right-4 z-[400] w-88 rounded-2xl bg-white/95 p-6 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900/95 dark:ring-white/10 backdrop-blur-md transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50">
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <!-- Route Icon -->
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Detalhes da Rota</h3>
              <span class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Operação de Pulverização</span>
            </div>
          </div>
          <button
            (click)="close()"
            class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Details Grid -->
        <div class="space-y-4 text-xs">
          <!-- Operator & Machine side by side -->
          <div class="grid grid-cols-2 gap-2.5">
            <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Operador</span>
              <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="details()!.operator_name || 'N/A'">
                {{ details()!.operator_name || 'Não informado' }}
              </span>
            </div>
            <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Máquina</span>
              <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="details()!.machine_name || 'N/A'">
                {{ details()!.machine_name || 'Não informada' }}
              </span>
            </div>
          </div>

          <!-- Points count details -->
          <div class="flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-slate-600 dark:text-slate-400 font-semibold">Pontos GPS da Rota</span>
            </div>
            <span class="font-bold text-slate-800 dark:text-white px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {{ details()!.track_points_count || 0 }}
            </span>
          </div>

          <!-- Applied Inputs -->
          @if (details()!.inputs && details()!.inputs.length > 0) {
            <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
              <span class="mb-2 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Insumos Aplicados</span>
              <div class="flex flex-wrap gap-1.5">
                @for (input of details()!.inputs; track input.product_name) {
                  <span class="inline-flex items-center rounded-lg bg-blue-50/60 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/30">
                    <span class="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                    {{ input.product_name }} ({{ input.dose || '-' }} {{ input.dose_unit || '' }})
                  </span>
                }
              </div>
            </div>
          }

          <!-- Notes -->
          @if (details()!.notes) {
            <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
              <span class="mb-1.5 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Observações</span>
              <div class="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-900/20 rounded-xl p-3">
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic">
                  "{{ details()!.notes }}"
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class OperationsMapDetailsCard {
  public operationsViewModel = inject(OperationsViewModel);

  public get details() {
    return this.operationsViewModel.selectedOperationDetails;
  }

  public close(): void {
    this.operationsViewModel.selectedOperationDetails.set(null);
  }
}
