import {
  AfterViewInit,
  Component,
  ElementRef,
  effect,
  inject,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-session-map',
  imports: [CommonModule],
  templateUrl: './spraying-session-map.html',
  styleUrls: ['./spraying-session-map.scss'],
})
export class SprayingSessionMapComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);
  private themeService = inject(ThemeService);

  public viewModel = inject(SprayingFlowViewModel);

  private map?: L.Map;
  private routeLayer?: L.Polyline;
  private plantsLayer = L.layerGroup();
  private routeMarkersLayer = L.layerGroup();

  constructor() {
    effect(() => {
      const visualization = this.viewModel.selectedVisualization();
      if (!visualization || !this.map) return;
      this.renderVisualization();
    });

    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      const container = this.elRef.nativeElement.querySelector('#spraying-session-map') as HTMLElement | null;
      if (container) {
        container.classList.toggle('map-dark', isDark);
      }
    });
  }

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initMap();
    this.renderVisualization();
  }

  public ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('spraying-session-map', {
      center: [-23.5505, -46.6333],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.plantsLayer.addTo(this.map);
    this.routeMarkersLayer.addTo(this.map);

    const isDark = this.themeService.currentTheme() === 'dark';
    const container = this.elRef.nativeElement.querySelector('#spraying-session-map') as HTMLElement | null;
    if (container) container.classList.toggle('map-dark', isDark);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private renderVisualization(): void {
    if (!this.map) return;

    const visualization = this.viewModel.selectedVisualization();
    this.routeLayer?.remove();
    this.routeMarkersLayer.clearLayers();
    this.plantsLayer.clearLayers();

    if (!visualization) return;

    const routeLatLngs = visualization.routePoints.map((point) => [point.latitude, point.longitude] as [number, number]);
    const plantLatLngs = visualization.plants.map((plant) => [plant.latitude, plant.longitude] as [number, number]);

    if (routeLatLngs.length > 0) {
      this.routeLayer = L.polyline(routeLatLngs, {
        color: '#2563eb',
        weight: 4,
        opacity: 0.9,
      }).addTo(this.map);

      const startPoint = visualization.routePoints[0];
      const endPoint = visualization.routePoints[visualization.routePoints.length - 1];

      L.circleMarker([startPoint.latitude, startPoint.longitude], {
        radius: 7,
        color: '#065f46',
        fillColor: '#10b981',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip('Início', { direction: 'top' })
        .addTo(this.routeMarkersLayer);

      L.circleMarker([endPoint.latitude, endPoint.longitude], {
        radius: 7,
        color: '#7f1d1d',
        fillColor: '#ef4444',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip('Fim', { direction: 'top' })
        .addTo(this.routeMarkersLayer);
    } else {
      this.routeLayer = undefined;
    }

    visualization.plants.forEach((plant) => {
      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 5,
        color: '#166534',
        fillColor: '#22c55e',
        fillOpacity: 0.95,
        weight: 2,
      })
        .bindTooltip(
          `${plant.variety ?? 'Planta'}${plant.distance_meters != null ? ` • ${plant.distance_meters.toFixed(1)}m` : ''}`,
          { direction: 'top' }
        )
        .addTo(this.plantsLayer);
    });

    const boundsPoints = [...routeLatLngs, ...plantLatLngs];
    if (boundsPoints.length > 0) {
      this.map.fitBounds(boundsPoints, { padding: [28, 28] });
    } else {
      this.map.setView([-23.5505, -46.6333], 15);
    }
  }
}
