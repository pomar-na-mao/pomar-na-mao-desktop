import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import type {
  HarvestForecastScenario,
  ProductiveHarvestClassification,
} from '../../../../domain/models/harvest-forecast.model';
import {
  Select,
  type SelectOption,
} from '../../../../shared/components/select/select';
import { HarvestForecastViewModel } from '../../../view-models/harvest-forecast/harvest-forecast.view-model';

@Component({
  selector: 'app-harvest-forecast-filters-panel',
  imports: [CommonModule, FormsModule, ButtonModule, DatePickerModule, Select],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <aside
      class="flex h-full min-h-0 flex-col bg-surface-0 dark:bg-surface-900"
    >
      <header
        class="shrink-0 border-b border-surface-200 bg-surface-50/50 px-3.5 pb-2 pt-4 dark:border-surface-800 dark:bg-surface-800/20"
      >
        <h4 class="font-bold text-surface-900 dark:text-surface-0 leading-none">
          Previsão de Safra
        </h4>
        <p
          class="mt-1 text-[10px] leading-none text-surface-500 dark:text-surface-400"
        >
          Classificação das plantas e estimativa por cenário
        </p>
      </header>

      <div class="flex-1 min-h-0 space-y-4 overflow-y-auto p-3.5 sm:p-4">
        <section aria-label="Filtros" class="space-y-3">
          <div>
            <label
              class="mb-1 block text-md font-medium text-surface-700 dark:text-surface-200"
            >
              Período de coleta
            </label>
            <div class="grid grid-cols-2 gap-2">
              <p-datepicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Início"
                ariaLabel="Início do período de coleta"
                [ngModel]="viewModel.startDate()"
                (ngModelChange)="onStartDateChange($event)"
                (onSelect)="focusEndDate()"
                [fluid]="true"
              />
              <p-datepicker
                #endDatePicker
                appendTo="body"
                [showIcon]="true"
                dateFormat="yy-mm-dd"
                dataType="string"
                placeholder="Fim"
                ariaLabel="Fim do período de coleta"
                [ngModel]="viewModel.endDate()"
                (ngModelChange)="viewModel.setEndDate($event)"
                [fluid]="true"
              />
            </div>
            @if (viewModel.dateError(); as error) {
              <p
                class="mt-1 text-xs text-red-600 dark:text-red-400"
                role="alert"
              >
                {{ error }}
              </p>
            }
          </div>

          <app-select
            label="Classificação"
            [ngModel]="selectedClassification"
            (ngModelChange)="onClassificationChange($event)"
            [options]="classificationOptions"
          />

          <app-select
            label="Zona"
            [ngModel]="viewModel.selectedZoneId()"
            (ngModelChange)="viewModel.setZoneId($event)"
            [options]="zoneOptions"
          />
        </section>

        <section
          aria-label="Cenários"
          class="space-y-3 border-t border-surface-200/60 pt-3 dark:border-surface-800/60"
        >
          <app-select
            label="Cenário da previsão"
            [ngModel]="viewModel.selectedScenario()"
            (ngModelChange)="viewModel.setScenario($event)"
            [options]="scenarioOptions"
          />

          <div
            class="overflow-x-auto rounded-xl border border-surface-200 dark:border-surface-700"
          >
            <table
              class="w-full min-w-[21rem] border-collapse text-xs"
              aria-label="Parâmetros de peso em quilogramas por pé"
            >
              <thead
                class="bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-100"
              >
                <tr>
                  <th scope="col" class="px-2 py-2 text-left">Peso</th>
                  @for (scenario of viewModel.scenarios; track scenario) {
                    <th
                      scope="col"
                      class="px-1 py-2 text-center"
                      [class.bg-primary-50]="
                        viewModel.selectedScenario() === scenario
                      "
                      [class.dark:bg-primary-950]="
                        viewModel.selectedScenario() === scenario
                      "
                    >
                      {{ viewModel.scenarioLabels[scenario] }}
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (
                  classification of viewModel.productiveClassifications;
                  track classification
                ) {
                  <tr
                    class="border-t border-surface-200 dark:border-surface-700"
                  >
                    <th
                      scope="row"
                      class="px-2 py-1.5 text-left text-surface-700 dark:text-surface-100"
                    >
                      {{ classification }}
                    </th>
                    @for (scenario of viewModel.scenarios; track scenario) {
                      <td
                        class="px-1 py-1.5"
                        [class.bg-primary-50]="
                          viewModel.selectedScenario() === scenario
                        "
                        [class.dark:bg-primary-950]="
                          viewModel.selectedScenario() === scenario
                        "
                      >
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          inputmode="decimal"
                          class="min-h-11 w-full cursor-text rounded-md border bg-surface-0 px-2 py-2 text-right text-sm text-surface-900 [appearance:textfield] outline-none transition-colors duration-200 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 dark:bg-surface-900 dark:text-surface-0"
                          [class.border-red-500]="
                            !viewModel.isWeightValid(scenario, classification)
                          "
                          [class.border-surface-300]="
                            viewModel.isWeightValid(scenario, classification)
                          "
                          [attr.aria-label]="
                            classification +
                            ' ' +
                            viewModel.scenarioLabels[scenario] +
                            ' em kg por pé'
                          "
                          [attr.aria-invalid]="
                            !viewModel.isWeightValid(scenario, classification)
                          "
                          [value]="displayWeight(scenario, classification)"
                          (input)="
                            onWeightInput(scenario, classification, $event)
                          "
                        />
                      </td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (!viewModel.weightsValid()) {
            <p class="text-xs text-red-600 dark:text-red-400" role="alert">
              Use somente pesos numéricos maiores ou iguais a zero.
            </p>
          }

          <p-button
            label="Previsão"
            icon="pi pi-chart-line"
            styleClass="w-full"
            [disabled]="!viewModel.canCalculate()"
            (onClick)="viewModel.calculate()"
          />

          <article
            class="mt-4 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-sm dark:border-surface-700 dark:bg-surface-900"
            aria-live="polite"
            aria-labelledby="forecast-estimate-title"
          >
            <div
              class="flex items-center justify-between gap-3 border-b border-surface-200 bg-surface-50 px-3 py-2.5 dark:border-surface-700 dark:bg-surface-800/60"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300"
                  aria-hidden="true"
                >
                  <i class="pi pi-chart-line text-sm"></i>
                </span>
                <div class="min-w-0">
                  <h4
                    id="forecast-estimate-title"
                    class="font-bold text-surface-900 dark:text-surface-0 leading-none"
                  >
                    Estimativa
                  </h4>

                  <p
                    class="truncate text-[10px] text-surface-500 dark:text-surface-400"
                  >
                    Produção por classificação
                  </p>
                </div>
              </div>
              <span
                class="shrink-0 rounded-full border border-surface-200 bg-surface-0 px-2 py-0.5 text-[10px] font-semibold text-surface-600 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-300"
              >
                kg
              </span>
            </div>

            <div class="divide-y divide-surface-100 dark:divide-surface-800">
              @for (
                classification of viewModel.productiveClassifications;
                track classification
              ) {
                <div
                  class="flex min-h-12 items-center justify-between gap-3 px-3 py-2"
                  [attr.data-estimate-classification]="classification"
                >
                  <div class="flex min-w-0 items-center gap-2.5">
                    <span
                      class="h-3 w-3 shrink-0 rounded-full border border-surface-900/20 shadow-sm dark:border-white/30"
                      [style.backgroundColor]="
                        viewModel.classificationColors[classification]
                      "
                      data-classification-color
                      aria-hidden="true"
                    ></span>
                    <span
                      class="truncate text-xs font-semibold text-surface-700 dark:text-surface-200"
                    >
                      {{ viewModel.classificationLabels[classification] }}
                    </span>
                  </div>

                  @if (viewModel.calculation(); as result) {
                    <div
                      class="flex shrink-0 items-baseline gap-2 text-right tabular-nums"
                    >
                      <span
                        class="text-[10px] text-surface-500 dark:text-surface-400"
                      >
                        {{ result.subtotals[classification].quantity }} ×
                        {{ result.subtotals[classification].weightKg }} kg
                      </span>
                      <span
                        class="min-w-16 text-xs font-bold text-surface-800 dark:text-surface-100"
                      >
                        =
                        {{
                          viewModel.formatKg(
                            result.subtotals[classification].subtotalKg
                          )
                        }}
                      </span>
                    </div>
                  } @else {
                    <span
                      class="min-w-16 text-right text-sm text-surface-400 dark:text-surface-500"
                      aria-label="Sem cálculo"
                    >
                      —
                    </span>
                  }
                </div>
              }
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-primary-200 bg-primary-50 px-3 py-3 dark:border-primary-900/70 dark:bg-primary-950/40"
            >
              <div>
                <span
                  class="block text-xs font-bold text-primary-900 dark:text-primary-100"
                >
                  Total estimado
                </span>
                <span
                  class="block text-[10px] text-primary-700 dark:text-primary-300"
                >
                  Cenário
                  {{ viewModel.scenarioLabels[viewModel.selectedScenario()] }}
                </span>
              </div>
              @if (viewModel.calculation(); as result) {
                <span
                  class="text-base font-bold tabular-nums text-primary-900 dark:text-primary-100"
                >
                  {{ viewModel.formatKg(result.totalKg) }}
                </span>
              } @else {
                <span
                  class="text-base font-bold text-primary-400 dark:text-primary-600"
                  aria-label="Total sem cálculo"
                >
                  —
                </span>
              }
            </div>
          </article>
        </section>
      </div>

      <footer
        class="shrink-0 border-t border-surface-200 bg-surface-50/50 p-3.5 dark:border-surface-800 dark:bg-surface-800/20 sm:p-4"
      >
        <p-button
          label="Limpar filtros"
          icon="pi pi-filter-slash"
          severity="secondary"
          size="small"
          [outlined]="true"
          styleClass="w-full"
          (onClick)="viewModel.clearFilters()"
        />
      </footer>
    </aside>
  `,
})
export class HarvestForecastFiltersPanel {
  @ViewChild('endDatePicker') public endDatePicker?: DatePicker;
  public viewModel = inject(HarvestForecastViewModel);

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todas as zonas', value: '' },
      ...this.viewModel
        .zones()
        .map((zone) => ({ label: zone.name, value: zone.id })),
    ];
  }

  public get selectedClassification(): string {
    return this.viewModel.selectedClassifications()[0] ?? '';
  }

  public get classificationOptions(): SelectOption[] {
    return [
      { label: 'Todas', value: '' },
      ...this.viewModel.classifications.map((classification) => ({
        label: `${classification} — ${this.viewModel.classificationLabels[classification]}`,
        value: classification,
        color: this.viewModel.classificationColors[classification],
      })),
    ];
  }

  public get scenarioOptions(): SelectOption[] {
    return this.viewModel.scenarios.map((scenario) => ({
      label: this.viewModel.scenarioLabels[scenario],
      value: scenario,
    }));
  }

  public onStartDateChange(value: string | null): void {
    this.viewModel.setStartDate(value);
    if (value) this.focusEndDate();
  }

  public focusEndDate(): void {
    setTimeout(() =>
      this.endDatePicker?.inputfieldViewChild?.nativeElement?.focus(),
    );
  }

  public onClassificationChange(value: string | number | string[]): void {
    const classification = Array.isArray(value)
      ? (value[0] ?? '')
      : String(value);
    this.viewModel.setClassifications(classification);
  }

  public displayWeight(
    scenario: HarvestForecastScenario,
    classification: ProductiveHarvestClassification,
  ): string | number {
    const value = this.viewModel.weights()[scenario][classification];
    return Number.isFinite(value) ? value : '';
  }

  public onWeightInput(
    scenario: HarvestForecastScenario,
    classification: ProductiveHarvestClassification,
    event: Event,
  ): void {
    this.viewModel.setWeight(
      scenario,
      classification,
      (event.target as HTMLInputElement).value,
    );
  }
}
