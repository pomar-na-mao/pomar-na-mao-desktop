import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TotalPlantsComponent } from '../../components/home/total-plants/total-plants';
import { OrchardVigorComponent } from '../../components/home/orchard-vigor/orchard-vigor';
import { ProgressCardComponent } from '../../components/home/progress-card/progress-card';
import { FarmOverviewMap } from '../../components/home/farm-overview-map/farm-overview-map';
import { RecentUpdatesTableComponent } from '../../components/home/recent-updates-table/recent-updates-table';
import { HomeAlertsForecastPanel } from '../../components/home/home-alerts-forecast-panel/home-alerts-forecast-panel';
import { HomeViewModel } from '../../view-models/home/home.view-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, TranslateModule, TotalPlantsComponent, OrchardVigorComponent, ProgressCardComponent, FarmOverviewMap, RecentUpdatesTableComponent, HomeAlertsForecastPanel],
  providers: [HomeViewModel]
})
export class Home {
  public viewModel = inject(HomeViewModel);

  constructor() {
    this.viewModel.initialize();
  }
}
