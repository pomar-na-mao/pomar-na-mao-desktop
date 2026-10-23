import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MipdViewModel } from '../../view-models/mipd/mipd.view-model';
import { MipdFiltersPanel } from './components/mipd-filters-panel';
import { MipdMap } from './components/mipd-map';

@Component({
  selector: 'app-mipd',
  imports: [CommonModule, MipdFiltersPanel, MipdMap],
  templateUrl: './mipd.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MipdViewModel],
})
export class Mipd {
  public mipdViewModel = inject(MipdViewModel);
}

