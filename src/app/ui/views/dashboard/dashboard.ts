import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel } from '../../view-models/dashboard/dashboard.view-model';
import { DashboardHeader } from './components/dashboard-header';
import { DashboardMetrics } from './components/dashboard-metrics';
import { DashboardMap } from './components/dashboard-map';
import { DashboardRecentActivities } from './components/dashboard-recent-activities';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DashboardHeader, DashboardMetrics, DashboardMap, DashboardRecentActivities],
  templateUrl: './dashboard.html',
  providers: [DashboardViewModel]
})
export class Dashboard {
}
