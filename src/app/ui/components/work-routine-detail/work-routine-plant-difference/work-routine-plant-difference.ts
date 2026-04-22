import { Component, inject, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { WorkRoutineSyncViewModel } from '../../../view-models/work-routine/work-routine-sync.view-model';

@Component({
  selector: 'app-work-routine-plant-difference',
  imports: [CommonModule, TranslateModule],
  providers: [WorkRoutineSyncViewModel],
  templateUrl: './work-routine-plant-difference.html',
  host: {
    'style': 'display: contents'
  }
})
export class WorkRoutinePlantDifference implements OnChanges, OnDestroy {
  @Input() id!: number;

  public workRoutineSyncViewModel = inject(WorkRoutineSyncViewModel);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.workRoutineSyncViewModel.initialize(this.id);
    }
  }

  public ngOnDestroy(): void {
    this.workRoutineSyncViewModel.cleanup();
  }
}
