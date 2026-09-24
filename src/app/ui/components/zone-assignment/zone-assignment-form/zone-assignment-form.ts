import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Select } from '../../../../shared/components/select/select';
import { ZoneAssignmentViewModel } from '../../../view-models/zone-assignment/zone-assignment.view-model';

@Component({
  selector: 'app-zone-assignment-form',
  standalone: true,
  imports: [CommonModule, Select],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './zone-assignment-form.html',
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

  public onToggleSelectAll(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.viewModel.toggleSelectAllPlants(input.checked);
  }
}
