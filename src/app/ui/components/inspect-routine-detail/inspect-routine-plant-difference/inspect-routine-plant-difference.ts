import { Component, inject, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { InspectRoutineSyncViewModel } from '../../../view-models/inspect-routine/inspect-routine-sync.view-model';

@Component({
  selector: 'app-inspect-routine-plant-difference',
  imports: [CommonModule, TranslateModule],
  providers: [InspectRoutineSyncViewModel],
  templateUrl: './inspect-routine-plant-difference.html',
  host: {
    'style': 'display: contents'
  }
})
export class InspectRoutinePlantDifference implements OnChanges, OnDestroy {
  @Input() id!: number;

  public inspectRoutineSyncViewModel = inject(InspectRoutineSyncViewModel);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.inspectRoutineSyncViewModel.initialize(this.id);
    }
  }

  public ngOnDestroy(): void {
    this.inspectRoutineSyncViewModel.cleanup();
  }
}
