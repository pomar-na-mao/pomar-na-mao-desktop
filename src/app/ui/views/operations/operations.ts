import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationsViewModel } from '../../view-models/operations/operations.view-model';
import { OperationsFiltersPanel } from './components/operations-filters-panel';
import { OperationsMap } from './components/operations-map';

@Component({
  selector: 'app-operations',
  imports: [CommonModule, OperationsFiltersPanel, OperationsMap],
  templateUrl: './operations.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [OperationsViewModel],
})
export class Operations {
  public operationsViewModel = inject(OperationsViewModel);
}
