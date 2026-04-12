import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NewPlantsViewModel } from '../../../view-models/new-plant/new-plants.view-model';
import { NewPlantApprovalMapComponent } from '../new-plant-approval-map/new-plant-approval-map';

@Component({
  selector: 'app-new-plants-table',
  imports: [CommonModule, TranslateModule, DatePipe, NewPlantApprovalMapComponent],
  templateUrl: './new-plants-table.html',
  styleUrl: './new-plants-table.scss',
})
export class NewPlantsTableComponent {
  public newPlantsViewModel = inject(NewPlantsViewModel);

  public openApprovalModal(newPlantId: string): void {
    this.newPlantsViewModel.openApprovalModal(newPlantId);
  }

  public closeApprovalModal(): void {
    this.newPlantsViewModel.closeApprovalModal();
  }

  public async approveSelectedNewPlant(): Promise<void> {
    await this.newPlantsViewModel.approveSelectedNewPlant();
  }
}
