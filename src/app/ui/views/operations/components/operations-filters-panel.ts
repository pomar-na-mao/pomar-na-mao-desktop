import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { Input } from '../../../../shared/components/input/input';
import { Select } from '../../../../shared/components/select/select';
import { ZonesRepository } from '../../../../data/repositories/zones/zones-repository';

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

        <!-- Período -->
        <section>
          <label
            class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
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

        <!-- Zona -->
        <section>
          <app-select
            label="Zona"
            [ngModel]="operationsViewModel.selectedZoneId()"
            (ngModelChange)="operationsViewModel.selectedZoneId.set($event)"
            [options]="zoneOptions"
          ></app-select>
        </section>

        <!-- Operação -->
        <section>
          <app-select
            label="Tipo de Operação"
            [ngModel]="operationsViewModel.selectedOperation()"
            (ngModelChange)="operationsViewModel.selectedOperation.set($event)"
            [options]="operationOptions"
          ></app-select>
        </section>
      </div>

      <!-- Divider and Footer Toggle -->
      @if (operationsViewModel.selectedOperation() === 'pulverizacao' && operationsViewModel.selectedZoneId()) {
      <hr class="border-slate-200 dark:border-slate-800" />

      <div class="px-4 py-4 shrink-0">
        <!-- Mostrar plantas (Toggle Switch) -->
        <div class="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Mostrar plantas</span>
            <span class="text-[9px] text-slate-400 dark:text-slate-500">Exibir árvores da zona</span>
          </div>
          <button
            type="button"
            (click)="toggleShowPlants()"
            class="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer"
            [class.bg-emerald-500]="operationsViewModel.showPlants()"
            [class.bg-slate-300]="!operationsViewModel.showPlants()"
            [class.dark:bg-slate-700]="!operationsViewModel.showPlants()"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              [class.translate-x-5]="operationsViewModel.showPlants()"
              [class.translate-x-0]="!operationsViewModel.showPlants()"
            ></span>
          </button>
        </div>
      </div>
      }
    </aside>
  `
})
export class OperationsFiltersPanel implements OnInit {
  public operationsViewModel = inject(OperationsViewModel);
  public zonesRepository = inject(ZonesRepository);

  public operationOptions = [
    { label: 'Todas as Operações', value: '' },
    { label: 'Pulverização', value: 'pulverizacao' },
    { label: 'Inspeção', value: 'inspecao' },
    { label: 'Anotação', value: 'anotacao' }
  ];

  public get zoneOptions() {
    const zones = this.zonesRepository.zones() || [];
    return [
      { label: 'Todas as Zonas', value: '' },
      ...zones.map((z) => ({ label: z.name, value: z.id }))
    ];
  }

  public toggleShowPlants(): void {
    if (this.operationsViewModel.selectedZoneId()) {
      this.operationsViewModel.showPlants.set(!this.operationsViewModel.showPlants());
    }
  }

  ngOnInit() {
    this.zonesRepository.findAll();
  }
}
