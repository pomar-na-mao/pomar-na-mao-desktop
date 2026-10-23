import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from '../../../../shared/components/select/select';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';

@Component({
  selector: 'app-mipd-filters-panel',
  imports: [CommonModule, FormsModule, DatePickerModule, Select, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside class="flex flex-col h-full min-h-0 bg-surface-0 dark:bg-surface-900">
      <div class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">Mipd</h4>
        <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">
          Manejo integrado de pragas e doenças
        </p>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        <div>
          <label class="block text-md font-medium text-surface-700 dark:text-surface-200 mb-1">
            Período
          </label>
          <div class="grid grid-cols-2 gap-2">
            <p-datepicker
              inputId="mipd-start-date"
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Início"
              [ngModel]="mipdViewModel.startDate()"
              (ngModelChange)="mipdViewModel.startDate.set($event || '')"
              [fluid]="true"
            />
            <p-datepicker
              inputId="mipd-end-date"
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Fim"
              [ngModel]="mipdViewModel.endDate()"
              (ngModelChange)="mipdViewModel.endDate.set($event || '')"
              [fluid]="true"
            />
          </div>
          @if (mipdViewModel.dateRangeInvalid()) {
            <p class="mt-1.5 text-[11px] font-medium text-red-600 dark:text-red-400" role="alert">
              A data inicial deve ser anterior ou igual à data final.
            </p>
          }
        </div>

        <app-select
          id="mipd-zone"
          label="Zona"
          placeholder="Todas as zonas"
          [ngModel]="mipdViewModel.selectedZoneId()"
          (ngModelChange)="mipdViewModel.selectedZoneId.set($event)"
          [options]="mipdViewModel.zoneOptions()"
        />

        <app-select
          id="mipd-occurrence-type"
          label="Praga ou doença"
          placeholder="Todos"
          [ngModel]="mipdViewModel.selectedOccurrenceTypeId()"
          (ngModelChange)="mipdViewModel.selectedOccurrenceTypeId.set($event)"
          [options]="mipdViewModel.occurrenceTypeOptions()"
        />
      </div>

      <div class="p-3.5 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <p-button
          label="Limpar Filtros"
          icon="pi pi-filter-slash"
          severity="secondary"
          size="small"
          [outlined]="true"
          (onClick)="mipdViewModel.clearFilters()"
          styleClass="w-full"
        />
      </div>
    </aside>
  `,
})
export class MipdFiltersPanel {
  public mipdViewModel = inject(MipdViewModel);
}
