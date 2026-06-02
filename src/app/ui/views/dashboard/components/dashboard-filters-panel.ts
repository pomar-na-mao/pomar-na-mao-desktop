import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';

@Component({
  selector: 'app-dashboard-filters-panel',
  imports: [CommonModule, FormsModule],
  template: `
    <aside
      class="flex h-full w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60"
    >
      <div class="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">

        <!-- Período -->
        <section>
          <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            Período
          </label>
          <div class="grid grid-cols-2 gap-2">
            <div class="relative">
              <svg
                class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                [ngModel]="dashboardViewModel.filterStartDate()"
                (ngModelChange)="dashboardViewModel.filterStartDate.set($event)"
                class="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-6.5 pr-1.5 font-mono text-[10.5px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
              />
            </div>
            <div class="relative">
              <svg
                class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                [ngModel]="dashboardViewModel.filterEndDate()"
                (ngModelChange)="dashboardViewModel.filterEndDate.set($event)"
                class="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-6.5 pr-1.5 font-mono text-[10.5px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
              />
            </div>
          </div>
        </section>

        <!-- Zona -->
        <section>
          <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            Zona
          </label>
          <select
            [ngModel]="dashboardViewModel.filterZoneId()"
            (ngModelChange)="dashboardViewModel.filterZoneId.set($event)"
            class="w-full appearance-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
          >
            <option value="">Todas as Zonas</option>
            @for (zone of dashboardViewModel.availableZones(); track zone.id) {
              <option [value]="zone.id">{{ zone.name }}</option>
            }
          </select>
        </section>

        <!-- Ocorrência -->
        <section>
          <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            Ocorrência
          </label>
          <select
            [ngModel]="dashboardViewModel.filterOccurrenceId()"
            (ngModelChange)="dashboardViewModel.filterOccurrenceId.set($event)"
            class="w-full appearance-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
          >
            <option value="">Remover todas</option>
            @for (occurrence of dashboardViewModel.availableOccurrences(); track occurrence.id) {
              <option [value]="occurrence.id">{{ occurrence.name }}</option>
            }
          </select>
        </section>

        <!-- Variedade -->
        <section>
          <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            Variedade
          </label>
          <select
            [ngModel]="dashboardViewModel.filterVarietyId()"
            (ngModelChange)="dashboardViewModel.filterVarietyId.set($event)"
            class="w-full appearance-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
          >
            <option value="">Todas as Variedades</option>
            @for (variety of dashboardViewModel.availableVarieties(); track variety.id) {
              <option [value]="variety.id">{{ variety.name }}</option>
            }
          </select>
        </section>

        <!-- Operação -->
        <section>
          <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
            Operação
          </label>
          <select
            [ngModel]="dashboardViewModel.filterOperation()"
            (ngModelChange)="dashboardViewModel.filterOperation.set($event)"
            class="w-full appearance-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-emerald-500"
          >
            <option value="">Remover todas</option>
            <option value="pulverizacao">Pulverização</option>
            <option value="inspecao">Inspeção</option>
            <option value="anotacao">Anotação</option>
            <option value="colheita">Colheita</option>
          </select>
        </section>

      </div>

      <!-- Divider and Legend Footer -->
      <hr class="border-slate-200 dark:border-slate-800" />
      
      <div class="px-4 py-4 shrink-0">
        <label class="mb-2 block text-[10px] font-semibold uppercase tracking-[0.06em] text-emerald-600 dark:text-emerald-400">
          Legenda de Variedades
        </label>
        <div class="flex flex-wrap gap-x-3 gap-y-1.5">
          @for (legend of dashboardViewModel.varietyLegend(); track legend.label) {
            <div class="flex items-center gap-1.5">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-sm border border-white/60 shadow-sm dark:border-white/10"
                [style.backgroundColor]="legend.color"
              ></span>
              <span class="text-[11px] text-slate-600 dark:text-slate-400">{{ legend.label }}</span>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class DashboardFiltersPanel {
  public dashboardViewModel = inject(DashboardViewModel);
}
