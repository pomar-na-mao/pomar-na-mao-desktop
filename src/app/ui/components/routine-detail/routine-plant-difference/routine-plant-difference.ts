import { Component, inject, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoutineSyncViewModel } from '../../../view-models/routine/routine-sync.view-model';

@Component({
  selector: 'app-routine-plant-difference',
  imports: [CommonModule],
  providers: [RoutineSyncViewModel],
  templateUrl: './routine-plant-difference.html',
  host: {
    'style': 'display: contents'
  }
})
export class RoutinePlantDifference implements OnChanges, OnDestroy {
  @Input() id!: number;

  public routineSyncViewModel = inject(RoutineSyncViewModel);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.routineSyncViewModel.initialize(this.id);
    }
  }

  public ngOnDestroy(): void {
    this.routineSyncViewModel.cleanup();
  }
}
