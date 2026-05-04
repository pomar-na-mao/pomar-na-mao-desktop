import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Select } from '../../../../shared/components/select/select';
import { MassInclusionViewModel } from '../../../view-models/mass-inclusion/mass-inclusion.view-model';

@Component({
  selector: 'app-mass-inclusion-map-filters',
  standalone: true,
  imports: [CommonModule, Select],
  templateUrl: './mass-inclusion-map-filters.html',
})
export class MassInclusionMapFilters {
  public massInclusionViewModel = inject(MassInclusionViewModel);
}
