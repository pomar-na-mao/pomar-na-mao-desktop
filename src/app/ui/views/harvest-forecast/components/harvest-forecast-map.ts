import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import {
  HARVEST_CLASSIFICATIONS,
  type HarvestClassification,
} from '../../../../domain/models/harvest-forecast.model';
import { Select, type SelectOption } from '../../../../shared/components/select/select';
import {
  HARVEST_CLASS_COLORS,
  HarvestForecastViewModel,
} from '../../../view-models/harvest-forecast/harvest-forecast.view-model';

@Component({
  selector: 'app-harvest-forecast-map',
  imports: [FormsModule, ButtonModule, Select],
  templateUrl: './harvest-forecast-map.html',
  styles: [':host { display: block; height: 100%; width: 100%; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HarvestForecastMap implements AfterViewInit, OnDestroy {
  public readonly viewModel = inject(HarvestForecastViewModel);
  public readonly classifications = HARVEST_CLASSIFICATIONS;
  public readonly classColors = HARVEST_CLASS_COLORS;
  public readonly classificationOptions: SelectOption[] = HARVEST_CLASSIFICATIONS.map(
    (classification) => ({
      label: classification,
      value: classification,
      color: HARVEST_CLASS_COLORS[classification],
    }),
  );

  public ngAfterViewInit(): void {
    this.viewModel.initMap('harvest-forecast-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.classList.remove('map-fullscreen-active');
    this.viewModel.destroyMap();
  }

  public count(classification: HarvestClassification): number {
    return this.viewModel.snapshot()?.class_counts[classification] ?? 0;
  }

  public toggleFullscreen(): void {
    const nextValue = !this.viewModel.isMapFullscreen();
    this.viewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    document.body.classList.toggle('map-fullscreen-active', nextValue);
    this.viewModel.invalidateMapSize();
  }
}
