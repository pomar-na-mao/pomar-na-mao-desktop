import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HarvestForecastViewModel } from '../../view-models/harvest-forecast/harvest-forecast.view-model';
import { HarvestForecastFiltersPanel } from './components/harvest-forecast-filters-panel';
import { HarvestForecastMap } from './components/harvest-forecast-map';

@Component({
  selector: 'app-harvest-forecast',
  imports: [HarvestForecastFiltersPanel, HarvestForecastMap],
  templateUrl: './harvest-forecast.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [HarvestForecastViewModel],
})
export class HarvestForecast implements OnInit {
  public viewModel = inject(HarvestForecastViewModel);

  public ngOnInit(): void {
    void this.viewModel.loadInitialData();
  }
}
