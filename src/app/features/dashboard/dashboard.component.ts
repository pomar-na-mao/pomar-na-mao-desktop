import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel } from './dashboard.view-model';

import { SelectComponent } from '../../shared/components/select/select.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SelectComponent],
  templateUrl: './dashboard.component.html',
  providers: [DashboardViewModel]
})
export class DashboardComponent {
  public vm = inject(DashboardViewModel);
}
