import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppSelect } from '../../../../shared/components';
import { FarmOverviewMapViewModel } from '../../../view-models/farm-overview-map/farm-overview-map.view-model';

@Component({
  selector: 'app-mass-inclusion-map-filters',
  imports: [CommonModule, TranslateModule, AppSelect],
  templateUrl: './mass-inclusion-map-filters.html',
})
export class MassInclusionMapFiltersComponent {
  public farmOverviewMapViewModel = inject(FarmOverviewMapViewModel);
}
