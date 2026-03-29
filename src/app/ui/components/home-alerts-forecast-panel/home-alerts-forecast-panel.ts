import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AlertsViewModel } from '../../view-models/alerts/alerts.view-model';

@Component({
  selector: 'app-home-alerts-forecast-panel',
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-alerts-forecast-panel.html',
  styleUrl: './home-alerts-forecast-panel.scss',
  providers: [AlertsViewModel],
})
export class HomeAlertsForecastPanel {
  public viewModel = inject(AlertsViewModel);
  public barHeights = ['30px', '50px', '40px', '65px', '55px', '75px', '60px'];

  constructor() {
    this.viewModel.initialize();
  }
}
