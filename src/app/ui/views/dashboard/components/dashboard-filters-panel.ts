import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { Input } from '../../../../shared/components/input/input';
import { Select, SelectOption } from '../../../../shared/components/select/select';

const LIVING_PLANT_COLOR = '#10b981';

@Component({
  selector: 'app-dashboard-filters-panel',
  imports: [CommonModule, FormsModule, Input, Select],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside
      class="flex h-full w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60"
    >
      <div class="sidebar-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <h2 class="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Filtros de busca
        </h2>

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

        <!-- Status da Planta -->
        <section>
          <app-select
            label="Status da Planta"
            [ngModel]="dashboardViewModel.filterPlantStatus()"
            (ngModelChange)="dashboardViewModel.filterPlantStatus.set($event)"
            [options]="plantStatusOptions"
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
      </div>
    </aside>
  `,
})
export class DashboardFiltersPanel {
  public dashboardViewModel = inject(DashboardViewModel);

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todas as Zonas', value: '' },
      ...this.dashboardViewModel.availableZones().map((z) => ({
        label: z.name,
        value: z.id,
      })),
    ];
  }

  public get occurrenceOptions(): SelectOption[] {
    return [
      { label: 'Remover todas', value: '' },
      ...this.dashboardViewModel.availableOccurrences().map((o) => ({
        label: o.name,
        value: o.id,
      })),
    ];
  }

  public get plantStatusOptions(): SelectOption[] {
    return [
      { label: 'Todos', value: '' },
      {
        label: 'Planta viva',
        value: 'alive',
        color: LIVING_PLANT_COLOR,
      },
      {
        label: 'Ponto vazio',
        value: 'empty',
        color: '#ef4444',
      },
    ];
  }

  public get varietyOptions(): SelectOption[] {
    const options: SelectOption[] = [
      { label: 'Todas as Variedades', value: '' },
      {
        label: 'Sem variedade',
        value: 'none',
      },
    ];

    const varieties = this.dashboardViewModel.availableVarieties();
    for (const v of varieties) {
      options.push({
        label: v.name,
        value: String(v.id),
      });
    }

    return options;
  }
}
