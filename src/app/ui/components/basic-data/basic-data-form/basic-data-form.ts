import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Select } from '../../../../shared/components/select/select';
import { BasicDataViewModel } from '../../../view-models/basic-data/basic-data.view-model';

@Component({
  selector: 'app-basic-data-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    TextareaModule,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './basic-data-form.html',
})
export class BasicDataForm {
  public basicDataViewModel = inject(BasicDataViewModel);

  public onSaveBasicDataFormData(): void {
    this.basicDataViewModel.onSaveBasicDataFormDataHandler();
  }

  public onPreviewPlantsInsidePolygon(): void {
    this.basicDataViewModel.onPreviewPlantsInsidePolygonHandler();
  }

  public onClearBasicDataFormData(): void {
    this.basicDataViewModel.onClearBasicDataFormDataHandler();
  }

  public onPlantSelectionChange(plantId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.basicDataViewModel.setPreviewPlantSelected(plantId, input.checked);
  }
}
