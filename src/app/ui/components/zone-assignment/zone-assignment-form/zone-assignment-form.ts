import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Select } from '../../../../shared/components/select/select';
import { ZoneAssignmentViewModel } from '../../../view-models/zone-assignment/zone-assignment.view-model';

@Component({
  selector: 'app-zone-assignment-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Select, ButtonModule, CheckboxModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './zone-assignment-form.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 0%;
        min-height: 0;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class ZoneAssignmentForm {
  public viewModel = inject(ZoneAssignmentViewModel);

  public onZoneChange(value: string | string[]): void {
    this.viewModel.onZoneChange(value);
  }

  public onUseZonePolygon(): void {
    this.viewModel.useZonePolygonAsSelection();
  }

  public onPreviewPlants(): void {
    this.viewModel.onPreviewPlants();
  }

  public onClear(): void {
    this.viewModel.clear();
  }

  public onSave(): void {
    this.viewModel.save();
  }

  public onPlantSelectionChange(plantId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.viewModel.setPlantSelected(plantId, input.checked);
  }

  public onPlantCheckboxChange(plantId: string, checked: boolean): void {
    this.viewModel.setPlantSelected(plantId, checked);
  }

  public onToggleSelectAll(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.viewModel.toggleSelectAllPlants(input.checked);
  }

  public onToggleSelectAllCheckbox(checked: boolean): void {
    this.viewModel.toggleSelectAllPlants(checked);
  }
}
