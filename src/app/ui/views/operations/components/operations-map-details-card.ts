import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';

@Component({
  selector: 'app-operations-map-details-card',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <!-- Case 1: Spraying Operation Details -->
    @if (sprayingDetails()) {
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
              <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="sprayingDetails()!.operator_name || 'N/A'">
                {{ sprayingDetails()!.operator_name || 'Não informado' }}
              </span>
            </div>
            <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Máquina</span>
              <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="sprayingDetails()!.machine_name || 'N/A'">
                {{ sprayingDetails()!.machine_name || 'Não informada' }}
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
              {{ sprayingDetails()!.track_points_count || 0 }}
            </span>
          </div>

          <!-- Applied Inputs -->
          @if (sprayingDetails()!.inputs && sprayingDetails()!.inputs.length > 0) {
            <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
              <span class="mb-2 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Insumos Aplicados</span>
              <div class="flex flex-wrap gap-1.5">
                @for (input of sprayingDetails()!.inputs; track input.product_name) {
                  <span class="inline-flex items-center rounded-lg bg-blue-50/60 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-400/30">
                    <span class="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                    {{ input.product_name }} ({{ input.dose || '-' }} {{ input.dose_unit || '' }})
                  </span>
                }
              </div>
            </div>
          }

          <!-- Notes -->
          @if (sprayingDetails()!.notes) {
            <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
              <span class="mb-1.5 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Observações</span>
              <div class="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-900/20 rounded-xl p-3">
                <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic">
                  "{{ sprayingDetails()!.notes }}"
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- Case 2: Inspection Operation Details (Plant Clicked) -->
    @if (inspectionDetails() && inspectionPlant()) {
      <div class="absolute top-4 bottom-4 right-4 z-[400] w-88 rounded-2xl bg-white/95 shadow-2xl ring-1 ring-slate-900/10 dark:bg-slate-900/95 dark:ring-white/10 backdrop-blur-md transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50 flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="px-6 pt-6 pb-0 shrink-0">
          <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Detalhes da Planta</h3>
                <span class="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                  {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Anotação Manual' : 'Inspeção Manual' }}
                </span>
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

          <!-- Carousel Controls -->
          @if (operationsViewModel.inspectionEntriesForPlant().length > 1) {
            <div class="mb-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <button
                (click)="operationsViewModel.navigateInspection('prev')"
                [disabled]="operationsViewModel.currentInspectionIndex() === 0"
                class="rounded-lg p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div class="text-center">
                <span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Anotações da Planta' : 'Inspeções da Planta' }}
                </span>
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {{ operationsViewModel.currentInspectionIndex() + 1 }} de {{ operationsViewModel.inspectionEntriesForPlant().length }}
                  <span class="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">
                    ({{ operationsViewModel.currentInspectionIndex() === 0 ? 'Mais recente' : operationsViewModel.currentInspectionIndex() === operationsViewModel.inspectionEntriesForPlant().length - 1 ? 'Mais antiga' : 'Anterior' }})
                  </span>
                </span>
              </div>
              <button
                (click)="operationsViewModel.navigateInspection('next')"
                [disabled]="operationsViewModel.currentInspectionIndex() === operationsViewModel.inspectionEntriesForPlant().length - 1"
                class="rounded-lg p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          }
        </div>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto px-6 pb-6">
          <div class="space-y-4 text-xs">
            <!-- Plant ID & Zone side by side -->
            <div class="grid grid-cols-2 gap-2.5">
              <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Identificação</span>
                <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="inspectionPlant()!.plant_id">
                  {{ inspectionPlant()!.plant_id.substring(0, 8) }}...
                </span>
              </div>
              <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Zona</span>
                <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate" [title]="inspectionDetails()!.zone_name || 'N/A'">
                  {{ inspectionDetails()!.zone_name || 'Não informada' }}
                </span>
              </div>
            </div>

            <!-- Coordinates -->
            <div class="flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-slate-600 dark:text-slate-400 font-semibold">Coordenadas</span>
              </div>
              <span class="font-bold text-slate-800 dark:text-white text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                {{ inspectionPlant()!.latitude.toFixed(6) }}, {{ inspectionPlant()!.longitude.toFixed(6) }}
              </span>
            </div>

            <!-- Inspection period -->
            <div class="grid grid-cols-2 gap-2.5">
              <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Início</span>
                <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                  {{ formatDate(inspectionDetails()!.started_at) }}
                </span>
              </div>
              <div class="bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Término</span>
                <span class="font-semibold text-slate-900 dark:text-slate-200 block truncate">
                  {{ inspectionDetails()!.finished_at ? formatDate(inspectionDetails()!.finished_at!) : 'Em andamento' }}
                </span>
              </div>
            </div>

            <!-- Occurrences count summary -->
            <div class="flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-slate-600 dark:text-slate-400 font-semibold">Total de Ocorrências</span>
              </div>
              <div class="flex items-center gap-1.5">
                @if (addedOccurrences.length > 0) {
                  <span class="font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    +{{ addedOccurrences.length }}
                  </span>
                }
                @if (removedOccurrences.length > 0) {
                  <span class="font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px]">
                    -{{ removedOccurrences.length }}
                  </span>
                }
                @if (addedOccurrences.length === 0 && removedOccurrences.length === 0) {
                  <span class="font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px]">
                    0
                  </span>
                }
              </div>
            </div>

            <!-- Added Occurrences -->
            @if (addedOccurrences.length > 0) {
              <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                <span class="mb-2 block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ocorrências Adicionadas</span>
                <div class="flex flex-col gap-1.5">
                  @for (occ of addedOccurrences; track occ.occurrence_id) {
                    <div class="flex flex-col rounded-xl bg-emerald-50/50 p-3 border border-emerald-100/50 dark:bg-emerald-500/5 dark:border-emerald-500/10">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          <span class="font-bold text-emerald-700 dark:text-emerald-400">{{ occ.occurrence_type_name }}</span>
                        </div>
                        @if (occ.severity) {
                          <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                            {{ occ.severity }}
                          </span>
                        }
                      </div>
                      @if (occ.notes) {
                        <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 italic leading-relaxed">"{{ occ.notes }}"</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Removed Occurrences -->
            @if (removedOccurrences.length > 0) {
              <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                <span class="mb-2 block text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Ocorrências Removidas</span>
                <div class="flex flex-col gap-1.5">
                  @for (occ of removedOccurrences; track occ.occurrence_id) {
                    <div class="flex flex-col rounded-xl bg-rose-50/50 p-3 border border-rose-100/50 dark:bg-rose-500/5 dark:border-rose-500/10">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                          <span class="font-bold text-rose-700 dark:text-rose-400">{{ occ.occurrence_type_name }}</span>
                        </div>
                        <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300">
                          Resolvida
                        </span>
                      </div>
                      @if (occ.notes) {
                        <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 italic leading-relaxed">"{{ occ.notes }}"</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Notes -->
            @if (inspectionDetails()!.notes) {
              <div class="pt-3.5 border-t border-slate-100 dark:border-slate-800/60">
                <span class="mb-1.5 block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Observações da Anotação' : 'Observações da Inspeção' }}
                </span>
                <div class="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-200/20 dark:border-amber-900/20 rounded-xl p-3">
                  <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic">
                    "{{ inspectionDetails()!.notes }}"
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class OperationsMapDetailsCard {
  public operationsViewModel = inject(OperationsViewModel);

  public get sprayingDetails() {
    return this.operationsViewModel.selectedOperationDetails;
  }

  public get inspectionDetails() {
    return this.operationsViewModel.selectedInspectionDetails;
  }

  public get inspectionPlant() {
    return this.operationsViewModel.selectedInspectionPlant;
  }

  public get addedOccurrences() {
    const plant = this.inspectionPlant();
    if (!plant || !plant.occurrences) return [];
    return plant.occurrences.filter(o => o.status === 'open');
  }

  public get removedOccurrences() {
    const plant = this.inspectionPlant();
    if (!plant || !plant.occurrences) return [];
    return plant.occurrences.filter(o => o.status === 'removed');
  }

  public formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public close(): void {
    this.operationsViewModel.selectedOperationDetails.set(null);
    this.operationsViewModel.clearInspectionSelection();
  }
}
