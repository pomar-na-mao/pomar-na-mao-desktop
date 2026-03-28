import { Component, AfterViewInit, OnDestroy, OnInit, inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import type { Region } from '../../../domain/models/regions.model';
import { AppSelect } from '../../../shared/components';
import { getConvexHull } from '../../../shared/utils/geolocation-math';
import { regionColors, getRandomColor } from '../../../shared/utils/colors';
import { MapCardViewModel } from '../../view-models/map-card/map-card.view-model';

@Component({
  selector: 'app-map-card',
  imports: [CommonModule, AppSelect],
  templateUrl: './map-card.html',
  styleUrls: ['./map-card.scss'],
  providers: [MapCardViewModel]
})
export class MapCardComponent implements OnInit, AfterViewInit, OnDestroy {
  private map?: L.Map;
  private regionPolygons: Map<string, L.Polygon> = new Map();
  private assignedColors: Map<string, string> = new Map();
  private platformId = inject(PLATFORM_ID);
  public vm = inject(MapCardViewModel);

  private defaultZoom = 15;

  constructor() {
    effect(() => {
      const regionId = this.vm.selectedRegionId();
      const region = this.vm.findRegionById(regionId);
      if (region) {
        this.focusRegion(region);
      }
    });

    effect(() => {
      // Re-render polygons if regions change
      if (this.vm.regionsGroupedByName().size > 0) {
        this.renderPolygons();
      }
    });
  }

  async ngOnInit() {
    await this.vm.loadRegions();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.renderPolygons();
      this.focusSelectedRegion();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private renderPolygons(): void {
    if (!this.map || !isPlatformBrowser(this.platformId)) return;

    // Clear existing polygons
    this.regionPolygons.forEach(polygon => polygon.remove());
    this.regionPolygons.clear();

    this.vm.regionsGroupedByName().forEach((points, regionName) => {
      if (!this.assignedColors.has(regionName)) {
        this.assignedColors.set(regionName, getRandomColor());
      }
      const color = this.assignedColors.get(regionName)!;
      const rawCoords = points.map(p => [p.latitude, p.longitude] as [number, number]);
      const hullCoords = getConvexHull(rawCoords);
      
      const polygon = L.polygon(hullCoords, {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2
      }).addTo(this.map!);

      polygon.bindTooltip(points[0].region, {
        permanent: true,
        direction: 'center',
        className: 'region-tooltip',
      });

      this.regionPolygons.set(regionName, polygon);
    });
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [-23.5505, -46.6333],
      zoom: 15,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  private focusSelectedRegion(): void {
    const selectedRegion = this.vm.findRegionById(this.vm.selectedRegionId());
    if (selectedRegion) {
      this.focusRegion(selectedRegion);
    } else if (this.regionPolygons.size > 0) {
      // If no region is selected but we have polygons, fit all of them
      const group = L.featureGroup(Array.from(this.regionPolygons.values()));
      this.map?.fitBounds(group.getBounds(), { padding: [40, 40] });
    }
  }


  private focusRegion(region: Region): void {
    const normalizedName = region.region.trim().toLocaleLowerCase();
    const polygon = this.regionPolygons.get(normalizedName);

    if (polygon) {
      this.map?.fitBounds(polygon.getBounds(), { padding: [20, 20] });
    } else {
      const coords: L.LatLngExpression = [region.latitude, region.longitude];
      this.map?.setView(coords, this.defaultZoom);
    }
  }
}
