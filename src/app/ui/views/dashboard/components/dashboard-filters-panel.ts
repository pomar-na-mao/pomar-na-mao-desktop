import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { Input } from '../../../../shared/components/input/input';
import { Select } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-dashboard-filters-panel',
  imports: [CommonModule, FormsModule, Input, Select],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside
      class="flex h-full w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60"
    >
      <div class="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <!-- Data de plantio -->
        <section>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Data de plantio
          </label>
          <div class="grid grid-cols-2 gap-2">
            <app-input
              type="date"
              [ngModel]="dashboardViewModel.filterPlantingStartDate()"
              (ngModelChange)="dashboardViewModel.filterPlantingStartDate.set($event)"
            ></app-input>
            <app-input
              type="date"
              [ngModel]="dashboardViewModel.filterPlantingEndDate()"
              (ngModelChange)="dashboardViewModel.filterPlantingEndDate.set($event)"
            ></app-input>
          </div>
        </section>

        <!-- Zona -->
        <section>
          <app-select
            label="Zona"
            [ngModel]="dashboardViewModel.filterZoneId()"
            (ngModelChange)="dashboardViewModel.filterZoneId.set($event)"
            [options]="zoneOptions"
          ></app-select>
        </section>

        <!-- Ocorrência -->
        <section>
          <app-select
            label="Ocorrência"
            [ngModel]="dashboardViewModel.filterOccurrenceId()"
            (ngModelChange)="dashboardViewModel.filterOccurrenceId.set($event)"
            [options]="occurrenceOptions"
          ></app-select>
        </section>

        <!-- Variedade -->
        <section>
          <app-select
            label="Variedade"
            [ngModel]="dashboardViewModel.filterVarietyId()"
            (ngModelChange)="dashboardViewModel.filterVarietyId.set($event)"
            [options]="varietyOptions"
          ></app-select>
        </section>

        <!-- Operação -->
        <section>
          <label
            class="mb-1 block text-[12px] font-semibold tracking-[0.06em] text-emerald-600 dark:text-emerald-400"
          >
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
        <label
          class="mb-2 block text-[12px] font-semibold tracking-[0.06em] text-emerald-600 dark:text-emerald-400"
        >
          Legenda de Variedades
        </label>
        <div class="flex flex-wrap gap-x-3 gap-y-1.5">
          @for (
            legend of dashboardViewModel.varietyLegend();
            track legend.label
          ) {
            <div class="flex items-center gap-1.5">
              <span
                class="h-2.5 w-2.5 shrink-0 rounded-sm border border-white/60 shadow-sm dark:border-white/10"
                [style.backgroundColor]="legend.color"
              ></span>
              <span class="text-[11px] text-slate-600 dark:text-slate-400">{{
                legend.label
              }}</span>
            </div>
          }
        </div>
      </div>
    </aside>
  `,
})
export class DashboardFiltersPanel {
  public dashboardViewModel = inject(DashboardViewModel);

  public get zoneOptions() {
    return [
      { label: 'Todas as Zonas', value: '' },
      ...this.dashboardViewModel.availableZones().map((z) => ({
        label: z.name,
        value: z.id,
      })),
    ];
  }

  public get occurrenceOptions() {
    return [
      { label: 'Remover todas', value: '' },
      ...this.dashboardViewModel.availableOccurrences().map((o) => ({
        label: o.name,
        value: o.id,
      })),
    ];
  }

  public get varietyOptions() {
    return [
      { label: 'Todas as Variedades', value: '' },
      ...this.dashboardViewModel.availableVarieties().map((v) => ({
        label: v.name,
        value: v.id,
      })),
    ];
  }
}
