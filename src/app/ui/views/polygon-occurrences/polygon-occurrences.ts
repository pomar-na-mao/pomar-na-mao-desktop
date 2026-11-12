import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import type { PolygonSelection } from '../../../domain/models/map-polygon.model';
import { MapPolygonSelector } from '../../components/map-polygon-selector/map-polygon-selector';
import { PolygonOccurrencesForm } from '../../components/polygon-occurrences/polygon-occurrences-form/polygon-occurrences-form';
import { PolygonOccurrencesViewModel } from '../../view-models/polygon-occurrences/polygon-occurrences.view-model';

@Component({
  selector: 'app-polygon-occurrences',
  standalone: true,
  imports: [ButtonModule, MapPolygonSelector, PolygonOccurrencesForm],
  templateUrl: './polygon-occurrences.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [PolygonOccurrencesViewModel],
})
export class PolygonOccurrences implements OnInit, OnDestroy {
  public viewModel = inject(PolygonOccurrencesViewModel);
  @ViewChild(MapPolygonSelector) public mapSelector!: MapPolygonSelector;

  public async ngOnInit(): Promise<void> {
    await this.viewModel.loadInitialData();
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.classList.remove('map-fullscreen-active');
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.viewModel.onPolygonSelected(event.coordinates);
  }

  public toggleFullscreen(): void {
    const next = !this.viewModel.isMapFullscreen();
    this.viewModel.isMapFullscreen.set(next);
    document.body.style.overflow = next ? 'hidden' : '';
    document.body.classList.toggle('map-fullscreen-active', next);
    setTimeout(() => this.mapSelector.invalidateSize(), 0);
  }
}

