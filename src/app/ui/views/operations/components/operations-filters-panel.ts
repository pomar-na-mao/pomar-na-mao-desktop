import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { Input } from '../../../../shared/components/input/input';
import { Select } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-operations-filters-panel',
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

        <!-- Periodo -->
        <section>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Per\u00edodo
          </label>
          <div class="grid grid-cols-2 gap-2">
            <app-input
              type="date"
              [ngModel]="operationsViewModel.startDate()"
              (ngModelChange)="operationsViewModel.startDate.set($event)"
            ></app-input>
            <app-input
              type="date"
              [ngModel]="operationsViewModel.endDate()"
              (ngModelChange)="operationsViewModel.endDate.set($event)"
            ></app-input>
          </div>
        </section>

        <!-- Operacao -->
        <section>
          <app-select
            label="Tipo de Opera\u00e7\u00e3o"
            [ngModel]="operationsViewModel.selectedOperation()"
            (ngModelChange)="operationsViewModel.selectedOperation.set($event)"
            [options]="operationOptions"
          ></app-select>
        </section>
      </div>
    </aside>
  `
})
export class OperationsFiltersPanel {
  public operationsViewModel = inject(OperationsViewModel);

  public operationOptions = [
    { label: 'Todas as Opera\u00e7\u00f5es', value: '' },
    { label: 'Pulveriza\u00e7\u00e3o', value: 'pulverizacao' },
    { label: 'Inspe\u00e7\u00e3o', value: 'inspecao' },
    { label: 'Anota\u00e7\u00e3o', value: 'anotacao' }
  ];
}