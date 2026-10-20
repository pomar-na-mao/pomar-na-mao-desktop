import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SeverityLabelPipe } from '../../../../shared/pipes/severity-label.pipe';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';

@Component({
  selector: 'app-operations-map-details-card',
  imports: [CommonModule, SeverityLabelPipe, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  template: `
    <!-- Case 1: Spraying Operation Details -->
    @if (sprayingDetails()) {
      <div
        class="ui-surface-raised absolute top-3 bottom-3 right-3 z-[410] flex w-80 sm:w-[28rem] max-w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] max-h-[calc(100vh-5rem)] flex-col overflow-y-auto rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-xl transition-all"
      >
        <!-- Header -->
        <div
          class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0 flex items-center justify-between"
        >
          <div>
            <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">
              Detalhes da Rota
            </h4>
            <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">
              Operação de Pulverização
            </p>
          </div>
          <p-button
            (onClick)="close()"
            icon="pi pi-times"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            size="small"
            ariaLabel="Fechar detalhes da operação"
          />
        </div>

        <!-- Details Content -->
        <div class="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 text-xs">
          <!-- Status & Telemetry Hero Strip -->
          <div
            class="rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-800/20 p-3.5 space-y-3"
          >
            <!-- Top Row: Status Pill -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-compass text-surface-400 text-xs"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Status da Operação</span>
              </div>
              @if (sprayingDetails()!.finished_at) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Concluída
                </span>
              } @else {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Em andamento
                </span>
              }
            </div>

            <!-- Telemetry Metrics Grid -->
            <div class="grid grid-cols-2 gap-2 text-xs">
              <!-- GPS Points -->
              <div
                class="rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200/70 dark:border-surface-800/70 p-2.5 flex items-center justify-between shadow-xs"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="h-7 w-7 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"
                  >
                    <i class="pi pi-map-marker text-xs"></i>
                  </div>
                  <div>
                    <span class="text-[10px] text-surface-500 dark:text-surface-400 block leading-tight">Pontos GPS</span>
                    <span class="font-bold text-xs text-surface-900 dark:text-surface-0">
                      {{ sprayingDetails()!.track_points_count || 0 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Duração -->
              <div
                class="rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200/70 dark:border-surface-800/70 p-2.5 flex items-center justify-between shadow-xs"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="h-7 w-7 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0"
                  >
                    <i class="pi pi-clock text-xs"></i>
                  </div>
                  <div>
                    <span class="text-[10px] text-surface-500 dark:text-surface-400 block leading-tight">Duração</span>
                    <span class="font-bold text-xs text-surface-900 dark:text-surface-0">
                      {{ calculateDuration(sprayingDetails()!.started_at, sprayingDetails()!.finished_at) || 'Em curso' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Operator & Machine Card -->
          <div
            class="rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-800/20 p-3.5 space-y-3"
          >
            <div class="flex items-center gap-1.5 pb-1 border-b border-surface-200/60 dark:border-surface-800/60">
              <i class="pi pi-id-card text-surface-400 text-xs"></i>
              <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Equipe e Equipamento</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <!-- Operador -->
              <div
                class="rounded-lg bg-surface-0/70 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1"
              >
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-user text-[11px] text-indigo-500"></i>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Operador</span>
                </div>
                <span
                  class="font-semibold text-surface-900 dark:text-surface-0 truncate"
                  [title]="sprayingDetails()!.operator_name || 'N/A'"
                >
                  {{ sprayingDetails()!.operator_name || 'Não informado' }}
                </span>
              </div>

              <!-- Máquina -->
              <div
                class="rounded-lg bg-surface-0/70 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1"
              >
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-cog text-[11px] text-amber-500"></i>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Máquina</span>
                </div>
                <span
                  class="font-semibold text-surface-900 dark:text-surface-0 truncate"
                  [title]="sprayingDetails()!.machine_name || 'N/A'"
                >
                  {{ sprayingDetails()!.machine_name || 'Não informada' }}
                </span>
              </div>
            </div>

            <!-- Horários de Início e Término -->
            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-surface-200/40 dark:border-surface-800/40 text-xs">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] text-surface-500 dark:text-surface-400">Início:</span>
                <span class="font-medium text-surface-900 dark:text-surface-0 text-[11px]">
                  {{ formatDate(sprayingDetails()!.started_at) }}
                </span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] text-surface-500 dark:text-surface-400">Término:</span>
                <span class="font-medium text-surface-900 dark:text-surface-0 text-[11px]">
                  {{ sprayingDetails()!.finished_at ? formatDate(sprayingDetails()!.finished_at!) : 'Em andamento' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Applied Inputs -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-box text-surface-400 text-xs"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Insumos Aplicados</span>
              </div>
              @if (sprayingDetails()!.inputs && sprayingDetails()!.inputs.length > 0) {
                <span
                  class="font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-[10px]"
                >
                  {{ sprayingDetails()!.inputs.length }} {{ sprayingDetails()!.inputs.length === 1 ? 'produto' : 'produtos' }}
                </span>
              }
            </div>

            @if (sprayingDetails()!.inputs && sprayingDetails()!.inputs.length > 0) {
              <div class="space-y-2">
                @for (input of sprayingDetails()!.inputs; track input.product_name) {
                  <div
                    class="rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-800/20 p-3 flex items-center justify-between shadow-xs transition-all"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="h-6 w-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <i class="pi pi-check text-[10px]"></i>
                      </div>
                      <span class="font-semibold text-xs text-surface-900 dark:text-surface-100 truncate" [title]="input.product_name">
                        {{ input.product_name }}
                      </span>
                    </div>
                    <span
                      class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 shrink-0 ml-2"
                    >
                      {{ input.dose || '-' }} {{ input.dose_unit || '' }}
                    </span>
                  </div>
                }
              </div>
            } @else {
              <div
                class="rounded-xl border border-dashed border-surface-200 dark:border-surface-800 p-3.5 text-center text-xs text-surface-500 dark:text-surface-400"
              >
                Nenhum insumo registrado nesta rota.
              </div>
            }
          </div>

          <!-- Observações (High-Visibility, Crisp & Clear Section) -->
          <div class="space-y-2 pt-1">
            <div class="flex items-center gap-1.5">
              <i class="pi pi-comment text-amber-500 text-xs"></i>
              <span class="text-xs font-medium text-surface-700 dark:text-surface-200">
                Observações da Operação
              </span>
            </div>

            @if (sprayingDetails()!.notes) {
              <div
                class="rounded-xl border-2 border-amber-300/80 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-2 shadow-xs"
              >
                <div class="flex items-center justify-between text-amber-800 dark:text-amber-300 text-[11px] font-semibold">
                  <div class="flex items-center gap-1.5">
                    <i class="pi pi-file-edit text-xs"></i>
                    <span>Anotação de Campo</span>
                  </div>
                  <span class="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-normal">Registro do operador</span>
                </div>
                <div class="rounded-lg bg-surface-0 dark:bg-surface-900 p-3.5 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                  <p class="text-sm font-semibold text-surface-900 dark:text-surface-0 leading-relaxed whitespace-pre-wrap select-text">
                    {{ sprayingDetails()!.notes }}
                  </p>
                </div>
              </div>
            } @else {
              <div
                class="rounded-xl border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-850/20 p-4 text-center text-xs text-surface-500 dark:text-surface-400"
              >
                <i class="pi pi-info-circle text-xs text-surface-400 mb-1 block"></i>
                Nenhuma observação informada para esta pulverização.
              </div>
            }
          </div>
        </div>

        <!-- Pinned Footer -->
        <div
          class="p-3.5 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0"
        >
          <p-button
            label="Fechar"
            icon="pi pi-times"
            severity="secondary"
            size="small"
            [outlined]="true"
            (onClick)="close()"
            styleClass="w-full"
          />
        </div>
      </div>
    }

    <!-- Case 2: Inspection Operation Details (Plant Clicked) -->
    @if (inspectionDetails() && inspectionPlant()) {
      <div
        class="ui-surface-raised absolute top-3 bottom-3 right-3 z-[410] flex w-80 sm:w-[28rem] max-w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-xl transition-all"
      >
        <!-- Header -->
        <div
          class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0 flex items-center justify-between"
        >
          <div>
            <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">
              Detalhes da Planta
            </h4>
            <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">
              {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Anotação Manual' : 'Inspeção Manual' }}
            </p>
          </div>
          <p-button
            (onClick)="close()"
            icon="pi pi-times"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            size="small"
            ariaLabel="Fechar detalhes da planta"
          />
        </div>

        <!-- Carousel / History Navigation -->
        @if (operationsViewModel.inspectionEntriesForPlant().length > 1) {
          <div
            class="shrink-0 flex items-center justify-between px-3.5 py-1.5 border-b border-surface-200 dark:border-surface-800 bg-surface-100/50 dark:bg-surface-800/40"
          >
            <p-button
              (onClick)="operationsViewModel.navigateInspection('prev')"
              [disabled]="operationsViewModel.currentInspectionIndex() === 0"
              icon="pi pi-chevron-left"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              size="small"
            />
            <div class="flex flex-col items-center">
              <span class="text-[10px] text-surface-500 dark:text-surface-400 leading-tight">
                {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Anotações da Planta' : 'Inspeções da Planta' }}
              </span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-xs font-semibold text-surface-900 dark:text-surface-100">
                  {{ operationsViewModel.currentInspectionIndex() + 1 }} de {{ operationsViewModel.inspectionEntriesForPlant().length }}
                </span>
                <span
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-surface-200/80 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
                >
                  {{ operationsViewModel.currentInspectionIndex() === 0 ? 'Mais recente' : operationsViewModel.currentInspectionIndex() === operationsViewModel.inspectionEntriesForPlant().length - 1 ? 'Mais antiga' : 'Anterior' }}
                </span>
              </div>
            </div>
            <p-button
              (onClick)="operationsViewModel.navigateInspection('next')"
              [disabled]="operationsViewModel.currentInspectionIndex() === operationsViewModel.inspectionEntriesForPlant().length - 1"
              icon="pi pi-chevron-right"
              [text]="true"
              [rounded]="true"
              severity="secondary"
              size="small"
            />
          </div>
        }

        <!-- Scrollable Content -->
        <div class="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <!-- Plant Details & Quick Summary Card -->
          <div
            class="rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/50 dark:bg-surface-800/20 p-3.5 space-y-3"
          >
            <!-- Top Row: Identificação Label & Health Status Pill -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-qrcode text-surface-400 text-xs"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Identificação</span>
              </div>
              @if (addedOccurrences.length > 0) {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  {{ addedOccurrences.length }} {{ addedOccurrences.length === 1 ? 'ocorrência' : 'ocorrências' }}
                </span>
              } @else {
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Saudável
                </span>
              }
            </div>

            <!-- Monospace Plant ID Box -->
            <div
              class="flex items-center justify-between rounded-lg bg-surface-0 dark:bg-surface-900 border border-surface-200/70 dark:border-surface-800/70 px-3 py-2 shadow-xs"
            >
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] text-surface-400 dark:text-surface-500 font-medium">ID da Planta</span>
                <span
                  class="font-mono text-xs font-bold text-surface-900 dark:text-surface-0 truncate"
                  [title]="inspectionPlant()!.plant_id"
                >
                  {{ inspectionPlant()!.plant_id }}
                </span>
              </div>
              <div class="h-6 w-6 rounded flex items-center justify-center shrink-0">
                @if (addedOccurrences.length === 0) {
                  <i class="pi pi-check-circle text-xs text-emerald-500"></i>
                } @else {
                  <i class="pi pi-exclamation-triangle text-xs text-amber-500"></i>
                }
              </div>
            </div>

            <!-- Context Metadata Grid -->
            <div class="grid grid-cols-2 gap-2 pt-1 text-xs">
              <!-- Zona -->
              <div
                class="rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1"
              >
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-map-marker text-[11px] text-emerald-500"></i>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Zona</span>
                </div>
                <span
                  class="font-semibold text-surface-900 dark:text-surface-0 truncate"
                  [title]="inspectionDetails()!.zone_name || 'Não informada'"
                >
                  {{ inspectionDetails()!.zone_name || 'Não informada' }}
                </span>
              </div>

              <!-- Data e Hora -->
              <div
                class="rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex flex-col gap-1"
              >
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-calendar text-[11px] text-blue-500"></i>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Data e Hora</span>
                </div>
                <span
                  class="font-semibold text-surface-900 dark:text-surface-0 text-[11px] truncate"
                  [title]="formatDate(inspectionDetails()!.started_at)"
                >
                  {{ formatDate(inspectionDetails()!.started_at) }}
                </span>
              </div>

              <!-- Coordenadas -->
              <div
                class="col-span-2 rounded-lg bg-surface-0/60 dark:bg-surface-900/40 border border-surface-200/50 dark:border-surface-800/50 p-2.5 flex items-center justify-between"
              >
                <div class="flex items-center gap-1.5 text-surface-400">
                  <i class="pi pi-compass text-[11px] text-indigo-500"></i>
                  <span class="text-xs font-medium text-surface-700 dark:text-surface-200">Coordenadas</span>
                </div>
                <span class="font-mono text-[11px] font-semibold text-surface-800 dark:text-surface-200">
                  {{ inspectionPlant()!.latitude.toFixed(6) }}, {{ inspectionPlant()!.longitude.toFixed(6) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Occurrences Breakdown -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-list text-surface-400 text-xs"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">
                  Ocorrências da Planta
                </span>
              </div>
              <div class="flex items-center gap-1.5">
                @if (addedOccurrences.length > 0) {
                  <span
                    class="font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[10px]"
                  >
                    +{{ addedOccurrences.length }}
                  </span>
                }
                @if (removedOccurrences.length > 0) {
                  <span
                    class="font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-[10px]"
                  >
                    -{{ removedOccurrences.length }}
                  </span>
                }
                @if (addedOccurrences.length === 0 && removedOccurrences.length === 0) {
                  <span
                    class="font-medium px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 text-[10px]"
                  >
                    0
                  </span>
                }
              </div>
            </div>

            <!-- Added Occurrences (Identificadas / Ativas) -->
            @if (addedOccurrences.length > 0) {
              <div class="space-y-2">
                <div class="flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Identificadas / Ativas
                  </span>
                </div>
                @for (occ of addedOccurrences; track occ.occurrence_id) {
                  <div
                    class="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 text-xs space-y-2 shadow-xs transition-all hover:border-emerald-300 dark:hover:border-emerald-800"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span class="font-semibold text-emerald-950 dark:text-emerald-100">
                          {{ occ.occurrence_type_name }}
                        </span>
                      </div>
                      @if (occ.severity) {
                        <span
                          class="text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-xs"
                          [ngClass]="getSeverityClass(occ.severity)"
                        >
                          {{ occ.severity | severityLabel }}
                        </span>
                      }
                    </div>
                    @if (occ.notes) {
                      <div
                        class="rounded-lg bg-surface-0/80 dark:bg-surface-900/60 border border-emerald-200/40 dark:border-emerald-900/30 p-2 text-[11px] text-surface-600 dark:text-surface-300 leading-relaxed italic flex items-start gap-1.5"
                      >
                        <i class="pi pi-comment text-[10px] text-surface-400 mt-0.5 shrink-0"></i>
                        <span>"{{ occ.notes }}"</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Removed Occurrences (Resolvidas / Removidas) -->
            @if (removedOccurrences.length > 0) {
              <div class="space-y-2 pt-1">
                <div class="flex items-center gap-1.5">
                  <span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  <span class="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                    Resolvidas / Removidas
                  </span>
                </div>
                @for (occ of removedOccurrences; track occ.occurrence_id) {
                  <div
                    class="rounded-xl border border-rose-200/70 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-3 text-xs space-y-2 shadow-xs transition-all"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
                        <span class="font-semibold text-rose-950 dark:text-rose-100 line-through">
                          {{ occ.occurrence_type_name }}
                        </span>
                      </div>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100/80 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/50"
                      >
                        Resolvida
                      </span>
                    </div>
                    @if (occ.notes) {
                      <div
                        class="rounded-lg bg-surface-0/80 dark:bg-surface-900/60 border border-rose-200/40 dark:border-rose-900/30 p-2 text-[11px] text-surface-600 dark:text-surface-300 leading-relaxed italic flex items-start gap-1.5"
                      >
                        <i class="pi pi-comment text-[10px] text-surface-400 mt-0.5 shrink-0"></i>
                        <span>"{{ occ.notes }}"</span>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            <!-- Empty State -->
            @if (addedOccurrences.length === 0 && removedOccurrences.length === 0) {
              <div
                class="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-surface-200 dark:border-surface-800 bg-surface-50/30 dark:bg-surface-850/20 text-center"
              >
                <div
                  class="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-200 dark:border-emerald-800/40"
                >
                  <i class="pi pi-check text-sm"></i>
                </div>
                <p class="text-xs font-semibold text-surface-800 dark:text-surface-200">
                  Nenhuma ocorrência registrada
                </p>
                <p class="text-[10px] text-surface-500 dark:text-surface-400 mt-0.5 max-w-[16rem]">
                  Esta planta não possui pragas ou anomalias registradas nesta inspeção.
                </p>
              </div>
            }
          </div>

          <!-- General Inspection / Annotation Notes -->
          @if (inspectionDetails()!.notes) {
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center gap-1.5">
                <i class="pi pi-align-left text-surface-400 text-xs"></i>
                <span class="text-xs font-medium text-surface-700 dark:text-surface-200">
                  {{ operationsViewModel.selectedOperation() === 'anotacao' ? 'Observações da Anotação' : 'Observações da Inspeção' }}
                </span>
              </div>
              <div
                class="p-3.5 rounded-xl border border-surface-200/80 dark:border-surface-800/80 bg-surface-50/70 dark:bg-surface-850/40 text-xs text-surface-700 dark:text-surface-300 leading-relaxed italic relative"
              >
                <i class="pi pi-comment absolute top-3 right-3 text-surface-300 dark:text-surface-700 text-sm pointer-events-none"></i>
                "{{ inspectionDetails()!.notes }}"
              </div>
            </div>
          }
        </div>

        <!-- Pinned Footer -->
        <div
          class="p-3.5 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0"
        >
          <p-button
            label="Fechar"
            icon="pi pi-times"
            severity="secondary"
            size="small"
            [outlined]="true"
            (onClick)="close()"
            styleClass="w-full"
          />
        </div>
      </div>
    }
  `,
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
    return plant.occurrences.filter((o) => o.status === 'open');
  }

  public get removedOccurrences() {
    const plant = this.inspectionPlant();
    if (!plant || !plant.occurrences) return [];
    return plant.occurrences.filter((o) => o.status === 'removed');
  }

  public getSeverityClass(severity: string | null): string {
    if (!severity) {
      return 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700';
    }
    const s = severity.toLowerCase();
    if (s.includes('crítica') || s.includes('critica') || s === 'critical') {
      return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60';
    }
    if (s.includes('alta') || s === 'high') {
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    }
    if (s.includes('média') || s.includes('media') || s === 'medium') {
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  }

  public calculateDuration(startedAt: string, finishedAt: string | null): string | null {
    if (!finishedAt) return null;
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs <= 0) return null;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  }

  public formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  public close(): void {
    this.operationsViewModel.selectedOperationDetails.set(null);
    this.operationsViewModel.clearInspectionSelection();
  }
}
