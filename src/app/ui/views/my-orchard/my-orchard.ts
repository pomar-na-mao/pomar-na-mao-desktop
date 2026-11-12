import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyOrchardViewModel } from '../../view-models/my-orchard/my-orchard.view-model';
import { MyOrchardMap } from './components/my-orchard-map';
import { MyOrchardFiltersPanel } from './components/my-orchard-filters-panel';

@Component({
  selector: 'app-my-orchard',
  imports: [CommonModule, MyOrchardMap, MyOrchardFiltersPanel],
  templateUrl: './my-orchard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MyOrchardViewModel],
})
export class MyOrchard {
  public myOrchardViewModel = inject(MyOrchardViewModel);
}
