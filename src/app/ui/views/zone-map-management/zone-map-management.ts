import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MapPolygonSelector } from '../../components/mass-inclusion/map-polygon-selector/map-polygon-selector';
import { ZoneMapManagementViewModel } from '../../view-models/zone-map-management/zone-map-management.view-model';
import type { PolygonSelection } from '../../../domain/models/mass-inclusion';

@Component({
  selector: 'app-zone-map-management',
  imports: [CommonModule, ReactiveFormsModule, MapPolygonSelector],
  templateUrl: './zone-map-management.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [ZoneMapManagementViewModel],
})
export class ZoneMapManagement implements OnInit, OnDestroy {
  public viewModel = inject(ZoneMapManagementViewModel);

  @ViewChild(MapPolygonSelector) public mapSelector!: MapPolygonSelector;

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

  public async onSubmit(): Promise<void> {
    await this.viewModel.save();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.viewModel.isMapFullscreen();
    this.viewModel.isMapFullscreen.set(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    setTimeout(() => {
      this.mapSelector.invalidateSize();
    }, 0);
  }
}
