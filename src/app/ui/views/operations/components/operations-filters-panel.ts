import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Select } from '../../../../shared/components/select/select';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';

@Component({
  selector: 'app-operations-filters-panel',
  imports: [CommonModule, FormsModule, DatePickerModule, Select, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside class="flex flex-col h-full min-h-0 bg-surface-0 dark:bg-surface-900">
      <!-- Title above form on the left -->
      <div class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">Operações</h4>
        <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none">Filtros de inspeções e pulverizações</p>
      </div>

      <!-- Form Body (Scrollable) -->
      <div class="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        <!-- Periodo -->
        <div>
          <label class="block text-md font-medium text-surface-700 dark:text-surface-200 mb-1">
            Período
          </label>
          <div class="grid grid-cols-2 gap-2">
            <p-datepicker
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Início"
              [ngModel]="operationsViewModel.startDate()"
              (ngModelChange)="operationsViewModel.startDate.set($event || '')"
              [fluid]="true"
            />
            <p-datepicker
              appendTo="body"
              [showIcon]="true"
              dateFormat="yy-mm-dd"
              dataType="string"
              placeholder="Fim"
              [ngModel]="operationsViewModel.endDate()"
              (ngModelChange)="operationsViewModel.endDate.set($event || '')"
              [fluid]="true"
            />
          </div>
        </div>

        <!-- Operacao -->
        <div>
          <app-select
            label="Tipo de Operação"
            [ngModel]="operationsViewModel.selectedOperation()"
            (ngModelChange)="operationsViewModel.selectedOperation.set($event)"
            [options]="operationOptions"
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
  `
})
export class OperationsFiltersPanel {
  public operationsViewModel = inject(OperationsViewModel);

  public operationOptions = [
    { label: 'Todas as Operações', value: '' },
    { label: 'Pulverização', value: 'pulverizacao' },
    { label: 'Inspeção', value: 'inspecao' },
  ];

  public clearFilters(): void {
    this.operationsViewModel.startDate.set('');
    this.operationsViewModel.endDate.set('');
    this.operationsViewModel.selectedOperation.set('');
  }
}
