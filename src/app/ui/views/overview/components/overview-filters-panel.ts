import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Select, SelectOption } from '../../../../shared/components/select/select';
import { OverviewViewModel } from '../../../view-models/overview/overview.view-model';

const LIVING_PLANT_COLOR = '#10b981';
const DEAD_PLANT_COLOR = '#ef4444';

@Component({
  selector: 'app-overview-filters-panel',
  imports: [CommonModule, FormsModule, DatePickerModule, Select, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside class="flex flex-col h-full min-h-0 bg-surface-0 dark:bg-surface-900">
      <!-- Title above form on the left -->
      <div class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">Pomar</h4>
        <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">Visão geral e monitoramento do pomar</p>
      </div>

      <!-- Form Body (Scrollable) -->
      <div class="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        <!-- Data de plantio -->
        <div>
          <label class="block text-md font-medium text-surface-700 dark:text-surface-200 mb-1">
            Data de Plantio
          </label>
          <div class="grid grid-cols-2 gap-2">
            <p-datepicker
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Início"
              [ngModel]="overviewViewModel.filterPlantingStartDate()"
              (ngModelChange)="overviewViewModel.filterPlantingStartDate.set($event || '')"
              [fluid]="true"
            />
            <p-datepicker
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Fim"
              [ngModel]="overviewViewModel.filterPlantingEndDate()"
              (ngModelChange)="overviewViewModel.filterPlantingEndDate.set($event || '')"
              [fluid]="true"
            />
          </div>
        </div>

        <!-- Zona -->
        <div>
          <app-select
            label="Zona"
            [ngModel]="overviewViewModel.filterZoneId()"
            (ngModelChange)="overviewViewModel.filterZoneId.set($event)"
            [options]="zoneOptions"
          ></app-select>
        </div>

        <!-- Ocorrência -->
        <div>
          <app-select
            label="Ocorrência"
            [ngModel]="overviewViewModel.filterOccurrenceId()"
            (ngModelChange)="overviewViewModel.filterOccurrenceId.set($event)"
            [options]="occurrenceOptions"
          ></app-select>
        </div>

        <!-- Status da Planta -->
        <div>
          <app-select
            label="Status da Planta"
            [ngModel]="overviewViewModel.filterPlantStatus()"
            (ngModelChange)="overviewViewModel.filterPlantStatus.set($event)"
            [options]="plantStatusOptions"
          ></app-select>
        </div>

        <!-- Variedade -->
        <div>
          <app-select
            label="Variedade"
            [ngModel]="overviewViewModel.filterVarietyId()"
            (ngModelChange)="overviewViewModel.filterVarietyId.set($event)"
            [options]="varietyOptions"
          ></app-select>
        </div>
      </div>

      <!-- Pinned Footer -->
      <div class="p-3.5 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <p-button
          label="Limpar Filtros"
          icon="pi pi-filter-slash"
          severity="secondary"
          size="small"
          [outlined]="true"
          (onClick)="clearFilters()"
          styleClass="w-full"
        />
      </div>
    </aside>
  `,
})
export class OverviewFiltersPanel {
  public overviewViewModel = inject(OverviewViewModel);

  public clearFilters(): void {
    this.overviewViewModel.filterPlantingStartDate.set('');
    this.overviewViewModel.filterPlantingEndDate.set('');
    this.overviewViewModel.filterZoneId.set('');
    this.overviewViewModel.filterOccurrenceId.set('');
    this.overviewViewModel.filterPlantStatus.set('');
    this.overviewViewModel.filterVarietyId.set('');
  }

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todas as Zonas', value: '' },
      ...this.overviewViewModel.availableZones().map((z) => ({
        label: z.name,
        value: z.id,
      })),
    ];
  }

  public get occurrenceOptions(): SelectOption[] {
    return [
      { label: 'Todas as Ocorrências', value: '' },
      ...this.overviewViewModel.availableOccurrences().map((o) => ({
        label: o.name,
        value: o.id,
      })),
    ];
  }

  public get plantStatusOptions(): SelectOption[] {
    return [
      { label: 'Todos os Status', value: '' },
      { label: 'Vivas', value: 'alive', color: LIVING_PLANT_COLOR },
      { label: 'Mortas', value: 'dead', color: DEAD_PLANT_COLOR },
    ];
  }

  public get varietyOptions(): SelectOption[] {
    return [
      { label: 'Todas as Variedades', value: '' },
      ...this.overviewViewModel.availableVarieties().map((v) => ({
        label: v.name,
        value: v.id,
      })),
    ];
  }
}
