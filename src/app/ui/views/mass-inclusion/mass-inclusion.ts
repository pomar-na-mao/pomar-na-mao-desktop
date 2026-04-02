import { MapPolygonSelectorComponent, type PolygonSelection } from '../../components/mass-inclusion/map-polygon-selector';
import { FarmOverviewMapViewModel } from '../../view-models/farm-overview-map/farm-overview-map.view-model';
import { AppSelect } from '../../../shared/components';
import { getConvexHull } from '../../../shared/utils/geolocation-math';
import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mass-inclusion',
  imports: [CommonModule, MapPolygonSelectorComponent, AppSelect, TranslateModule],
  templateUrl: './mass-inclusion.html',
  styleUrls: ['./mass-inclusion.scss'],
  providers: [FarmOverviewMapViewModel]
})
export class MassInclusion implements OnInit {
  public farmOverviewMapViewModel = inject(FarmOverviewMapViewModel);

  public backgroundPolygon = computed(() => {
    const regionId = this.farmOverviewMapViewModel.selectedRegionId();
    const regions = this.farmOverviewMapViewModel.regionsGroupedByName();
    const selectedRegion = this.farmOverviewMapViewModel.findRegionById(regionId);

    if (!selectedRegion) return null;

    const normalizedName = selectedRegion.region.trim().toLocaleLowerCase();
    const points = regions.get(normalizedName);

    if (!points || points.length === 0) return null;

    const rawCoords = points.map(p => [p.latitude, p.longitude] as [number, number]);
    return getConvexHull(rawCoords);
  });

  public async ngOnInit(): Promise<void> {
    await this.farmOverviewMapViewModel.loadRegions();
  }

  public onPolygonSelected(event: PolygonSelection): void {
    console.log(event);
  }
}
