import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPolygonSelector } from '../../components/mass-inclusion/map-polygon-selector/map-polygon-selector';
import { ZoneAssignmentForm } from '../../components/zone-assignment/zone-assignment-form/zone-assignment-form';
import { ZoneAssignmentViewModel } from '../../view-models/zone-assignment/zone-assignment.view-model';
import type { PolygonSelection } from '../../../domain/models/mass-inclusion';

@Component({
  selector: 'app-zone-assignment',
  standalone: true,
  imports: [CommonModule, MapPolygonSelector, ZoneAssignmentForm],
  templateUrl: './zone-assignment.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [ZoneAssignmentViewModel],
})
export class ZoneAssignment implements OnInit, OnDestroy {
  public viewModel = inject(ZoneAssignmentViewModel);

  @ViewChild(MapPolygonSelector) public mapSelector!: MapPolygonSelector;

  constructor() {
    effect(() => {
      const polygon = this.viewModel.applyZonePolygonSignal();
      if (polygon && this.mapSelector) {
        this.mapSelector.setExternalPolygon(polygon);
        this.viewModel.applyZonePolygonSignal.set(null);
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    await this.viewModel.loadInitialData();
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.viewModel.onPolygonSelected(event.coordinates);
  }

  public onPolygonCleared(): void {
    this.viewModel.onPolygonCleared();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.viewModel.isMapFullscreen();
    this.viewModel.isMapFullscreen.set(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    setTimeout(() => {
      this.mapSelector?.invalidateSize();
    }, 0);
  }
}
