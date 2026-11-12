import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Select, SelectOption } from '../../../../shared/components/select/select';
import {
  LIVING_PLANT_COLOR,
  NON_EXISTENT_PLANT_COLOR,
  MyOrchardViewModel,
} from '../../../view-models/my-orchard/my-orchard.view-model';

@Component({
  selector: 'app-my-orchard-filters-panel',
  imports: [CommonModule, FormsModule, DatePickerModule, Select, ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside class="flex flex-col h-full min-h-0 bg-surface-0 dark:bg-surface-900">
      <!-- Title above form on the left -->
      <div class="px-3.5 pt-4 pb-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/20 shrink-0">
        <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">Meu Pomar</h4>
        <p class="text-[10px] text-surface-500 dark:text-surface-400 leading-none mt-1">
          Monitoramento cartográfico, ocorrências e operações
        </p>
      </div>

      <!-- Form Body (Scrollable) -->
      <div class="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-4">
        <!-- 1. Ocorrências (Multi-select com destaque) -->
        <div>
          <app-select
            label="Visualizar Ocorrências"
            [multiple]="true"
            placeholder="Selecione ocorrências..."
            [ngModel]="myOrchardViewModel.selectedOccurrenceIds()"
            (ngModelChange)="onOccurrencesChange($event)"
            [options]="occurrenceOptions"
          ></app-select>
          <span class="text-[10px] text-surface-400 dark:text-surface-500 block mt-0.5">
            Mantém as plantas visíveis e destaca em laranja as afetadas
          </span>
        </div>

        <!-- 2. Doenças (MIPD - Multi-select) -->
        <div>
          <app-select
            label="Plantas com Doença (MIPD)"
            [multiple]="true"
            placeholder="Selecione doenças/pragas..."
            [ngModel]="myOrchardViewModel.selectedDiseaseIds()"
            (ngModelChange)="myOrchardViewModel.selectedDiseaseIds.set($event)"
            [options]="diseaseOptions"
          ></app-select>
          <span class="text-[10px] text-surface-400 dark:text-surface-500 block mt-0.5">
            Exibe registros coletados de pragas e doenças no MIPD
          </span>
        </div>

        <!-- 3. Operações Realizadas -->
        <div class="pt-2 border-t border-surface-200/60 dark:border-surface-800/60 space-y-3">
          <label class="block text-xs font-bold text-surface-800 dark:text-surface-100 uppercase tracking-wider">
            Operações Realizadas
          </label>

          <!-- Tipo de Operação -->
          <div>
            <app-select
              label="Tipo de Operação"
              [ngModel]="myOrchardViewModel.selectedOperationType()"
              (ngModelChange)="myOrchardViewModel.selectedOperationType.set($event)"
              [options]="operationOptions"
            ></app-select>
          </div>

          <!-- Período de Operação -->
          <div>
            <label class="block text-xs font-medium text-surface-700 dark:text-surface-200 mb-1">
              Período da Operação
            </label>
            <div class="grid grid-cols-2 gap-2">
              <p-datepicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Início"
                [ngModel]="myOrchardViewModel.operationStartDate()"
                (ngModelChange)="onOperationStartDateChange($event)"
                (onSelect)="onOperationStartDateSelect()"
                [fluid]="true"
              />
              <p-datepicker
                #operationEndDatePicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Fim"
                [ngModel]="myOrchardViewModel.operationEndDate()"
                (ngModelChange)="myOrchardViewModel.operationEndDate.set($event || '')"
                [fluid]="true"
              />
            </div>
          </div>
        </div>

        <!-- 4. Filtros Gerais do Pomar (Zonas, Variedades, Mudas) -->
        <div class="pt-2 border-t border-surface-200/60 dark:border-surface-800/60 space-y-3">
          <label class="block text-xs font-bold text-surface-800 dark:text-surface-100 uppercase tracking-wider">
            Filtros do Pomar
          </label>

          <!-- Zona (Foco individual opcional) -->
          <div>
            <app-select
              label="Filtrar por Zona"
              [ngModel]="myOrchardViewModel.filterZoneId()"
              (ngModelChange)="myOrchardViewModel.filterZoneId.set($event)"
              [options]="zoneOptions"
            ></app-select>
          </div>

          <!-- Status da Planta -->
          <div>
            <app-select
              label="Status da Planta"
              [ngModel]="myOrchardViewModel.filterPlantStatus()"
              (ngModelChange)="myOrchardViewModel.filterPlantStatus.set($event)"
              [options]="plantStatusOptions"
            ></app-select>
          </div>

          <!-- Variedade -->
          <div>
            <app-select
              label="Variedade"
              [ngModel]="myOrchardViewModel.filterVarietyId()"
              (ngModelChange)="myOrchardViewModel.filterVarietyId.set($event)"
              [options]="varietyOptions"
            ></app-select>
          </div>

          <!-- Data de plantio -->
          <div>
            <label class="block text-xs font-medium text-surface-700 dark:text-surface-200 mb-1">
              Data de Plantio das Mudas
            </label>
            <div class="grid grid-cols-2 gap-2">
              <p-datepicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Início"
                [ngModel]="myOrchardViewModel.filterPlantingStartDate()"
                (ngModelChange)="myOrchardViewModel.filterPlantingStartDate.set($event || '')"
                [fluid]="true"
              />
              <p-datepicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Fim"
                [ngModel]="myOrchardViewModel.filterPlantingEndDate()"
                (ngModelChange)="myOrchardViewModel.filterPlantingEndDate.set($event || '')"
                [fluid]="true"
              />
            </div>
          </div>
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
export class MyOrchardFiltersPanel {
  @ViewChild('operationEndDatePicker') public operationEndDatePicker?: DatePicker;

  public myOrchardViewModel = inject(MyOrchardViewModel);

  public clearFilters(): void {
    this.myOrchardViewModel.clearFilters();
  }

  public onOperationStartDateChange(value: string | null): void {
    this.myOrchardViewModel.operationStartDate.set(value || '');
    if (value) {
      this.focusOperationEndDate();
    }
  }

  public onOperationStartDateSelect(): void {
    this.focusOperationEndDate();
  }

  public focusOperationEndDate(): void {
    setTimeout(() => {
      const inputEl = this.operationEndDatePicker?.inputfieldViewChild?.nativeElement as HTMLInputElement | undefined;
      if (inputEl && typeof inputEl.focus === 'function') {
        inputEl.focus();
      }
    });
  }

  public onOccurrencesChange(value: string | string[]): void {
    const arr = Array.isArray(value) ? value : value ? [value] : [];
    this.myOrchardViewModel.selectedOccurrenceIds.set(arr);
  }

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todos os Talhões', value: '' },
      ...this.myOrchardViewModel.availableZones().map((z) => ({
        label: z.name,
        value: z.id,
      })),
    ];
  }

  public get occurrenceOptions(): SelectOption[] {
    return this.myOrchardViewModel.availableOccurrences().map((o) => ({
      label: o.name,
      value: o.id,
    }));
  }

  public get diseaseOptions(): SelectOption[] {
    return this.myOrchardViewModel.availableDiseases().map((d) => ({
      label: d.name,
      value: d.id,
    }));
  }

  public get operationOptions(): SelectOption[] {
    return [
      { label: 'Nenhuma / Não filtrar', value: '' },
      { label: 'Inspeção Manual', value: 'inspecao' },
      { label: 'Anotação / Ocorrência', value: 'ocorrencia' },
    ];
  }

  public get plantStatusOptions(): SelectOption[] {
    return [
      { label: 'Todos os Status', value: '' },
      { label: 'Vivas', value: 'alive', color: LIVING_PLANT_COLOR },
      { label: 'Não existentes', value: 'non_existent', color: NON_EXISTENT_PLANT_COLOR },
    ];
  }

  public get varietyOptions(): SelectOption[] {
    return [
      { label: 'Todas as Variedades', value: '' },
      ...this.myOrchardViewModel.availableVarieties().map((v) => ({
        label: v.name,
        value: String(v.id),
      })),
    ];
  }
}
