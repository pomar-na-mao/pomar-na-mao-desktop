import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppSelect } from '../../../../shared/components';
import { MassInclusionViewModel } from '../../../view-models/mass-inclusion/mass-inclusion.view-model';

@Component({
  selector: 'app-mass-inclusion-map-filters',
  imports: [CommonModule, TranslateModule, AppSelect],
  templateUrl: './mass-inclusion-map-filters.html',
})
export class MassInclusionMapFiltersComponent {
  public massInclusionViewModel = inject(MassInclusionViewModel);
}
