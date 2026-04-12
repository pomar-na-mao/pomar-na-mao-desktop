import { AfterViewInit, Component, computed, inject, Input, OnChanges, OnDestroy, PLATFORM_ID, signal, SimpleChanges, effect, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { InspectAnnotationRepository } from '../../../../data/repositories/inspect-annotation/inspect-annotation-repository';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-inspect-annotation-current-point-map',
  imports: [CommonModule],
  templateUrl: './inspect-annotation-current-point-map.html',
  host: {
    style: 'display: contents',
  },
})
export class InspectAnnotationCurrentPointMap implements AfterViewInit, OnChanges, OnDestroy {
  private static readonly ANNOTATION_ZOOM = 19;

  @Input() id!: string;

  private platformId = inject(PLATFORM_ID);
  private repository = inject(InspectAnnotationRepository);
  private themeService = inject(ThemeService);
  private elRef = inject(ElementRef);

  private map?: L.Map;
  private mapReady = signal(false);
  private currentId = signal<string | null>(null);
  private annotationCircle?: L.Circle;

  public selectedAnnotation = computed(() => {
    const id = this.currentId();
    if (!id) return null;

    return this.repository.inspectAnnotations().find(annotation => annotation.id === id) ?? null;
  });

  constructor() {
    effect(() => {
      if (!this.mapReady() || !this.map) return;

      const annotation = this.selectedAnnotation();

      if (!annotation || annotation.latitude === null || annotation.longitude === null) return;

      const coords: L.LatLngExpression = [annotation.latitude, annotation.longitude];

      if (this.annotationCircle) {
        this.annotationCircle.setLatLng(coords);
      } else {
        this.annotationCircle = L.circle(coords, {
          radius: 4,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.9,
          weight: 2,
        }).addTo(this.map);
      }

      this.focusAnnotation(coords);
    });

    effect(() => {
      const isDark = this.themeService.currentTheme() === 'dark';
      const container = this.elRef.nativeElement.querySelector('#map-detail') as HTMLElement | null;
      if (container) {
        container.classList.toggle('map-dark', isDark);
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id) {
      this.currentId.set(this.id);
    }
  }

  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  public ngOnDestroy(): void {
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map('map-detail', {
      center: [-23.5505, -46.6333],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Initial dark state
    const isDark = this.themeService.currentTheme() === 'dark';
    const container = this.elRef.nativeElement.querySelector('#map-detail') as HTMLElement | null;
    if (container) container.classList.toggle('map-dark', isDark);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = defaultIcon;

    const annotation = this.selectedAnnotation();
    if (annotation && annotation.latitude !== null && annotation.longitude !== null) {
      const coords: L.LatLngExpression = [annotation.latitude, annotation.longitude];
      this.annotationCircle = L.circle(coords, {
        radius: 4,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(this.map);
      this.focusAnnotation(coords);
    } else {
      this.annotationCircle = L.circle([-23.5505, -46.6333], {
        radius: 4,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(this.map);
    }

    setTimeout(() => {
      this.map?.invalidateSize();
      this.mapReady.set(true);
    }, 100);
  }

  public zoomIn(): void {
    this.map?.zoomIn();
  }

  public zoomOut(): void {
    this.map?.zoomOut();
  }

  private focusAnnotation(coords: L.LatLngExpression): void {
    this.map?.setView(coords, InspectAnnotationCurrentPointMap.ANNOTATION_ZOOM);
  }
}
