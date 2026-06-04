import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel } from '../../view-models/dashboard/dashboard.view-model';
import { DashboardMap } from './components/dashboard-map';
import { DashboardFiltersPanel } from './components/dashboard-filters-panel';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardMap, DashboardFiltersPanel],
  templateUrl: './dashboard.html',
  providers: [DashboardViewModel]
})
export class Dashboard {
  public dashboardViewModel = inject(DashboardViewModel);
}
