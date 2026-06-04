import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Select } from '../../../../shared/components/select/select';
import { MassInclusionViewModel } from '../../../view-models/mass-inclusion/mass-inclusion.view-model';

@Component({
  selector: 'app-mass-inclusion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './mass-inclusion-form.html',
})
export class MassInclusionForm {
  public massInclusionViewModel = inject(MassInclusionViewModel);

  public onSaveMassInclusionData(): void {
    this.massInclusionViewModel.onSaveMassInclusionDataHandler();
  }

  public onPreviewPlantsInsidePolygon(): void {
    this.massInclusionViewModel.onPreviewPlantsInsidePolygonHandler();
  }

  public onClearMassInclusionFormData(): void {
    this.massInclusionViewModel.onClearMassInclusionFormDataHandler();
  }

  public onPlantSelectionChange(plantId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.massInclusionViewModel.setPreviewPlantSelected(plantId, input.checked);
  }
}
