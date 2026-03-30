import { Component, inject, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InspectRoutineSyncViewModel } from '../../../../ui/view-models/inspect-routine/inspect-routine-sync.view-model';
import { TranslateModule } from '@ngx-translate/core';

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

  public vm = inject(InspectRoutineSyncViewModel);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.vm.initialize(this.id);
    }
  }

  public ngOnDestroy(): void {
    this.vm.cleanup();
  }
}
