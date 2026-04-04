import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppButton, AppInput, AppSelect } from '../../../../shared/components';
import { MassInclusionViewModel } from '../../../view-models/mass-inclusion/mass-inclusion.view-model';

@Component({
  selector: 'app-mass-inclusion-form',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, AppSelect, AppInput, AppButton],
  templateUrl: './mass-inclusion-form.html',
  styleUrls: ['./mass-inclusion-form.scss'],
})
export class MassInclusionFormComponent {
  public massInclusionViewModel = inject(MassInclusionViewModel);

  public onSave(): void {
    this.massInclusionViewModel.saveForm();
  }

  public onClear(): void {
    this.massInclusionViewModel.clearForm();
  }
}
