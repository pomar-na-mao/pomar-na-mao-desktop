import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../pipes/time-ago.pipe';
import { CountOccurrencesPipe } from '../../../pipes/count-occurrences.pipe';
import { HomeViewModel } from '../../../view-models/home/home.view-model';
import { PlantDetailModalComponent } from '../../plant-detail-modal/plant-detail-modal';
import type { PlantRecentUpdate } from '../../../../domain/models/plant-data.model';

@Component({
  selector: 'app-recent-updates-table',
  standalone: true,
  imports: [CommonModule, TranslateModule, TitleCasePipe, TimeAgoPipe, CountOccurrencesPipe, PlantDetailModalComponent],
  templateUrl: './recent-updates-table.html',
  styleUrl: './recent-updates-table.scss',
})
export class RecentUpdatesTableComponent {
  public viewModel = inject(HomeViewModel);

  public formattedUpdates = computed(() => {
    return this.viewModel.recentUpdates().map(plant => ({
      ...plant,
      formattedId: `${plant.id.toString().split("-")[0]}`
    }));
  });

  public openPlantDetail(plant: PlantRecentUpdate): void {
    this.viewModel.openPlantDetail(plant);
  }
}