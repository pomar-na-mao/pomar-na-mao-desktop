import { AfterViewInit, Component, ElementRef, inject, Input, OnChanges, OnDestroy, PLATFORM_ID, SimpleChanges, viewChild, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import type { INewPlant } from '../../../../domain/models/new-plant.model';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-new-plant-approval-map',
  imports: [CommonModule],
  templateUrl: './new-plant-approval-map.html',
  host: {
    style: 'display: contents',
  },
})
export class NewPlantApprovalMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private static readonly NEW_PLANT_ZOOM = 19;
  private static readonly DEFAULT_COORDINATES: L.LatLngExpression = [-23.5505, -46.6333];

  @Input() newPlant: INewPlant | null = null;

  private platformId = inject(PLATFORM_ID);
  private themeService = inject(ThemeService);
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private map?: L.Map;
  private plantMarker?: L.Marker;

  constructor() {
    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      const container = this.mapContainer().nativeElement;
      if (container) {
        container.classList.toggle('map-dark', isDark);
      }
    });
  }

  public ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.initializeMap();
    this.renderPlantMarker();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['newPlant'] && this.map) {
      this.renderPlantMarker();
    }
  }

  public ngOnDestroy(): void {
    this.map?.remove();
  }

  public zoomIn(): void {
    this.map?.zoomIn();
  }

  public zoomOut(): void {
    this.map?.zoomOut();
  }

  private initializeMap(): void {
    const mapElement = this.mapContainer().nativeElement;

    this.map = L.map(mapElement, {
      center: NewPlantApprovalMapComponent.DEFAULT_COORDINATES,
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    // Apply dark class immediately if needed
    const isDark = this.themeService.currentTheme() === 'dark';
    mapElement.classList.toggle('map-dark', isDark);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

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

  private renderPlantMarker(): void {
    if (!this.map || !this.newPlant) return;

    const coordinates: L.LatLngExpression = [this.newPlant.latitude, this.newPlant.longitude];

    if (this.plantMarker) {
      this.plantMarker.setLatLng(coordinates);
    } else {
      this.plantMarker = L.marker(coordinates).addTo(this.map);
    }

    this.map.setView(coordinates, NewPlantApprovalMapComponent.NEW_PLANT_ZOOM);
  }
}
