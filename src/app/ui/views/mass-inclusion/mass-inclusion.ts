import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MassInclusionViewModel } from '../../view-models/mass-inclusion/mass-inclusion.view-model';
import { MassInclusionForm } from '../../components/mass-inclusion/mass-inclusion-form/mass-inclusion-form';
import type { PolygonSelection } from '../../../domain/models/mass-inclusion';
import { MapPolygonSelector } from '../../components/mass-inclusion/map-polygon-selector/map-polygon-selector';
import { MassInclusionMapFilters } from '../../components/mass-inclusion/mass-inclusion-map-filters/mass-inclusion-map-filters';

@Component({
  selector: 'app-mass-inclusion',
  standalone: true,
  imports: [
    CommonModule,
    MassInclusionForm,
    MassInclusionMapFilters,
    MapPolygonSelector,
  ],
  templateUrl: './mass-inclusion.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [MassInclusionViewModel],
})
export class MassInclusion implements OnInit {
  public massInclusionViewModel = inject(MassInclusionViewModel);

  public async ngOnInit(): Promise<void> {
    await this.massInclusionViewModel.loadZones();
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.massInclusionViewModel.onPolygonSelected(event.coordinates);
  }

  public onPolygonCleared(): void {
    this.massInclusionViewModel.onPolygonCleared();
  }
}
