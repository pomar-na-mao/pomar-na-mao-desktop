import { MapPolygonSelectorComponent, type PolygonSelection } from '../../components/mass-inclusion/map-polygon-selector/map-polygon-selector';
import { MassInclusionMapFiltersComponent } from '../../components/mass-inclusion/mass-inclusion-map-filters/mass-inclusion-map-filters';
import { MassInclusionFormComponent } from '../../components/mass-inclusion/mass-inclusion-form/mass-inclusion-form';
import { MassInclusionViewModel } from '../../view-models/mass-inclusion/mass-inclusion.view-model';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mass-inclusion',
  imports: [
    CommonModule,
    MapPolygonSelectorComponent,
    MassInclusionMapFiltersComponent,
    MassInclusionFormComponent,
    TranslateModule,
  ],
  templateUrl: './mass-inclusion.html',
  styleUrls: ['./mass-inclusion.scss'],
  providers: [MassInclusionViewModel]
})
export class MassInclusion implements OnInit {
  public massInclusionViewModel = inject(MassInclusionViewModel);

  public async ngOnInit(): Promise<void> {
    await this.massInclusionViewModel.loadRegions();
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.massInclusionViewModel.onPolygonSelected(event);
  }

  public onPolygonCleared(): void {
    this.massInclusionViewModel.onPolygonCleared();
  }
}
