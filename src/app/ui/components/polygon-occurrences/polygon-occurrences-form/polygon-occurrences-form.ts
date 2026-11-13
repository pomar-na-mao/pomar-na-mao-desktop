import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Select } from '../../../../shared/components/select/select';
import { PolygonOccurrencesViewModel } from '../../../view-models/polygon-occurrences/polygon-occurrences.view-model';

@Component({
  selector: 'app-polygon-occurrences-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, Select],
  templateUrl: './polygon-occurrences-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PolygonOccurrencesForm {
  public viewModel = inject(PolygonOccurrencesViewModel);
}

