import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TitleCasePipe } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { CountOccurrencesPipe } from '../../pipes/count-occurrences.pipe';
import type { PlantRecentUpdate } from '../../../domain/models/plant-data.model';

@Component({
  selector: 'app-recent-updates-table',
  standalone: true,
  imports: [CommonModule, TranslateModule, TitleCasePipe, TimeAgoPipe, CountOccurrencesPipe],
  templateUrl: './recent-updates-table.html',
  styleUrl: './recent-updates-table.scss',
})
export class RecentUpdatesTableComponent {
  updates = input<PlantRecentUpdate[]>([]);
  isLoading = input<boolean>(false);
  refresh = output<void>();

  formattedUpdates = computed(() => {
    return this.updates().map(plant => ({
      ...plant,
      formattedId: `${plant.id.toString().split("-")[0]}`
    }));
  });

  onRefresh() {
    this.refresh.emit();
  }
}
