import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MassInclusionViewModel } from '../../view-models/mass-inclusion/mass-inclusion.view-model';
import { MassInclusionForm } from '../../components/mass-inclusion/mass-inclusion-form/mass-inclusion-form';
import type { PolygonSelection } from '../../../domain/models/mass-inclusion';
import { MapPolygonSelector } from '../../components/mass-inclusion/map-polygon-selector/map-polygon-selector';

@Component({
  selector: 'app-mass-inclusion',
  standalone: true,
  imports: [
    CommonModule,
    MassInclusionForm,
    MapPolygonSelector,
  ],
  templateUrl: './mass-inclusion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MassInclusionViewModel],
})
export class MassInclusion implements OnInit, OnDestroy {
  public massInclusionViewModel = inject(MassInclusionViewModel);

  @ViewChild(MapPolygonSelector) public mapSelector!: MapPolygonSelector;

  public async ngOnInit(): Promise<void> {
    await this.massInclusionViewModel.loadZones();
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.massInclusionViewModel.onPolygonSelected(event.coordinates);
  }

  public onPolygonCleared(): void {
    this.massInclusionViewModel.onPolygonCleared();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.massInclusionViewModel.isMapFullscreen();
    this.massInclusionViewModel.isMapFullscreen.set(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    setTimeout(() => {
      this.mapSelector.invalidateSize();
    }, 0);
  }
}
