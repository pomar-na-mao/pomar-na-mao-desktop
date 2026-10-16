import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Input } from '../../../../shared/components/input/input';
import { Select } from '../../../../shared/components/select/select';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';

@Component({
  selector: 'app-operations-filters-panel',
  imports: [CommonModule, FormsModule, Input, Select],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside class="ui-form-panel responsive-filter-shell h-auto md:h-full">
      <details open class="flex h-full min-h-0 flex-col">
        <summary class="ui-form-panel-header responsive-filter-summary">
          <span>Filtros de busca</span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <div class="ui-form-panel-header hidden md:block">
          <h2 class="ui-form-panel-title">Filtros de busca</h2>
          <p class="ui-form-panel-description">Filtre o período e o tipo de operação.</p>
        </div>
      <div class="ui-form-panel-body responsive-filter-content sidebar-scroll max-h-[min(24rem,calc(100vh-8rem))] space-y-3.5 overflow-y-auto md:max-h-none">

        <!-- Periodo -->
        <section>
          <label
            class="ui-field-label mb-1"
          >
            Período
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
      </details>
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
}
