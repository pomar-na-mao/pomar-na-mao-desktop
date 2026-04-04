import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FarmOverviewMap } from '../../components/home/farm-overview-map/farm-overview-map';
import { RecentUpdatesTableComponent } from '../../components/home/recent-updates-table/recent-updates-table';
import { HomeAlertsForecastPanel } from '../../components/home/home-alerts-forecast-panel/home-alerts-forecast-panel';
import { FarmBaseStatus } from '../../components/home/farm-base-status/farm-base-status';
import { HomeViewModel } from '../../view-models/home/home.view-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [CommonModule, TranslateModule, FarmOverviewMap, RecentUpdatesTableComponent, HomeAlertsForecastPanel, FarmBaseStatus],
  providers: [HomeViewModel]
})
export class Home {
  public viewModel = inject(HomeViewModel);

  constructor() {
    this.viewModel.initialize();
  }
}
