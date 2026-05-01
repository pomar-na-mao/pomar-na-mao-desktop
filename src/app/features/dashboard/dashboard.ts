import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel } from './dashboard.view-model';
import { Select } from '../../shared/components/select/select';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Select],
  templateUrl: './dashboard.html',
  providers: [DashboardViewModel]
})
export class Dashboard {
  public vm = inject(DashboardViewModel);
}
