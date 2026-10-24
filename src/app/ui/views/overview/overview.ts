import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewViewModel } from '../../view-models/overview/overview.view-model';
import { OverviewMap } from './components/overview-map';
import { OverviewFiltersPanel } from './components/overview-filters-panel';

@Component({
  selector: 'app-overview',
  imports: [CommonModule, OverviewMap, OverviewFiltersPanel],
  templateUrl: './overview.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [OverviewViewModel],
})
export class Overview {
  public overviewViewModel = inject(OverviewViewModel);
}
