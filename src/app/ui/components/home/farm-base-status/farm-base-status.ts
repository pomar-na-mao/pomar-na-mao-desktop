import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TotalPlantsComponent } from '../total-plants/total-plants';
import { OrchardVigorComponent } from '../orchard-vigor/orchard-vigor';
import { ProgressCardComponent } from '../progress-card/progress-card';
import { HomeViewModel } from '../../../view-models/home/home.view-model';

@Component({
  selector: 'app-farm-base-status',
  imports: [
    CommonModule,
    TranslateModule,
    TotalPlantsComponent,
    OrchardVigorComponent,
    ProgressCardComponent
  ],
  templateUrl: './farm-base-status.html',
})
export class FarmBaseStatus {
  public viewModel = inject(HomeViewModel);
}
