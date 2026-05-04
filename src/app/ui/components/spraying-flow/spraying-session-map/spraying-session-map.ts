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
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-session-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spraying-session-map.html',
  styles: [`
    :host { display: block; height: 100%; width: 100%; }
    #spraying-session-map { width: 100%; height: 100%; z-index: 1; }
  `],
})
export class SprayingSessionMapComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private elRef = inject(ElementRef);

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
      zoomControl: false, // Removed as per migration plan
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.plantsLayer.addTo(this.map);
    this.routeMarkersLayer.addTo(this.map);

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
      // Use blue for the route
      this.routeLayer = L.polyline(routeLatLngs, {
        color: '#3b82f6', // Blue-500
        weight: 4,
        opacity: 0.8,
      }).addTo(this.map);

      const startPoint = visualization.routePoints[0];
      const endPoint = visualization.routePoints[visualization.routePoints.length - 1];

      L.circleMarker([startPoint.latitude, startPoint.longitude], {
        radius: 7,
        color: '#ffffff',
        fillColor: '#3b82f6',
        fillOpacity: 1,
        weight: 3,
      })
        .bindTooltip('Início', { direction: 'top' })
        .addTo(this.routeMarkersLayer);

      L.circleMarker([endPoint.latitude, endPoint.longitude], {
        radius: 7,
        color: '#ffffff',
        fillColor: '#ef4444',
        fillOpacity: 1,
        weight: 3,
      })
        .bindTooltip('Fim', { direction: 'top' })
        .addTo(this.routeMarkersLayer);
    } else {
      this.routeLayer = undefined;
    }

    visualization.plants.forEach((plant) => {
      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 5,
        color: '#064e3b', // Emerald-900
        fillColor: '#34d399', // Emerald-400
        fillOpacity: 0.9,
        weight: 1.5,
      })
        .bindTooltip(
          `${plant.variety ?? 'Planta'}${plant.distance_meters != null ? ` • ${plant.distance_meters.toFixed(1)}m` : ''}`,
          { direction: 'top' }
        )
        .addTo(this.plantsLayer);
    });

    const boundsPoints = [...routeLatLngs, ...plantLatLngs];
    if (boundsPoints.length > 0) {
      this.map.fitBounds(boundsPoints, { padding: [32, 32] });
    } else {
      this.map.setView([-23.5505, -46.6333], 15);
    }
  }
}
