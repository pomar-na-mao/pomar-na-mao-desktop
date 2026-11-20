import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  HARVEST_SCENARIOS,
  HARVEST_WEIGHT_CLASSIFICATIONS,
  type HarvestScenario,
  type HarvestWeightClassification,
} from '../../../../domain/models/harvest-forecast.model';
import {
  Select,
  type SelectOption,
} from '../../../../shared/components/select/select';
import { HarvestForecastViewModel } from '../../../view-models/harvest-forecast/harvest-forecast.view-model';

@Component({
  selector: 'app-harvest-forecast-panel',
  imports: [CommonModule, FormsModule, ButtonModule, Select],
  templateUrl: './harvest-forecast-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HarvestForecastPanel {
  public readonly viewModel = inject(HarvestForecastViewModel);
  public readonly classifications = HARVEST_WEIGHT_CLASSIFICATIONS;
  public readonly scenarios = HARVEST_SCENARIOS;

  public readonly classificationOptions: SelectOption[] = [
    { label: 'Todas', value: 'TODAS' },
    { label: 'N', value: 'N' },
    { label: 'P', value: 'P' },
    { label: 'M', value: 'M' },
    { label: 'G', value: 'G' },
    { label: 'GG', value: 'GG' },
  ];
  public readonly scenarioOptions: SelectOption[] = [
    { label: 'Otimista', value: 'OTIMISTA' },
    { label: 'Realista', value: 'REALISTA' },
    { label: 'Pessimista', value: 'PESSIMISTA' },
  ];

  public scenarioLabel(scenario: HarvestScenario): string {
    return (
      this.scenarioOptions.find((option) => option.value === scenario)?.label ??
      scenario
    );
  }

  public weight(
    scenario: HarvestScenario,
    classification: HarvestWeightClassification,
  ): number {
    return this.viewModel.weights()[scenario][classification];
  }

  public formatWeight(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2,
    }).format(value);
  }
}
