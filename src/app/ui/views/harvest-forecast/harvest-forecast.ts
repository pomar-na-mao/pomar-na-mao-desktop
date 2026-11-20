import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { HarvestForecastViewModel } from '../../view-models/harvest-forecast/harvest-forecast.view-model';
import { HarvestForecastMap } from './components/harvest-forecast-map';
import { HarvestForecastPanel } from './components/harvest-forecast-panel';

@Component({
  selector: 'app-harvest-forecast',
  imports: [HarvestForecastPanel, HarvestForecastMap],
  templateUrl: './harvest-forecast.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [HarvestForecastViewModel],
})
export class HarvestForecast implements OnInit {
  public readonly viewModel = inject(HarvestForecastViewModel);

  public ngOnInit(): void {
    void this.viewModel.initialize();
  }
}
