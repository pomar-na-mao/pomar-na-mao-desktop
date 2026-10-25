import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BasicDataViewModel } from '../../view-models/basic-data/basic-data.view-model';
import { BasicDataForm } from '../../components/basic-data/basic-data-form/basic-data-form';
import type { PolygonSelection } from '../../../domain/models/basic-data';
import { MapPolygonSelector } from '../../components/basic-data/map-polygon-selector/map-polygon-selector';

@Component({
  selector: 'app-basic-data',
  standalone: true,
  imports: [
    CommonModule,
    BasicDataForm,
    MapPolygonSelector,
    ButtonModule,
  ],
  templateUrl: './basic-data.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [BasicDataViewModel],
})
export class BasicData implements OnInit, OnDestroy {
  public basicDataViewModel = inject(BasicDataViewModel);

  @ViewChild(MapPolygonSelector) public mapSelector!: MapPolygonSelector;

  public async ngOnInit(): Promise<void> {
    await this.basicDataViewModel.loadZones();
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.basicDataViewModel.onPolygonSelected(event.coordinates);
  }

  public onPolygonCleared(): void {
    this.basicDataViewModel.onPolygonCleared();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.basicDataViewModel.isMapFullscreen();
    this.basicDataViewModel.isMapFullscreen.set(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    setTimeout(() => {
      this.mapSelector.invalidateSize();
    }, 0);
  }
}
