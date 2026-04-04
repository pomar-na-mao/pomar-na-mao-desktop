import { Component, inject, Input, AfterViewInit, OnDestroy, PLATFORM_ID, effect, OnInit, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import { InspectRoutinePlantsRepository } from '../../../../data/repositories/inspect-routine-plants/inspect-routine-plants-repository';
import { InspectRoutineRepository } from '../../../../data/repositories/inspect-routine/inspect-routine-repository';
import { RegionsRepository } from '../../../../data/repositories/regions/regions-repository';
import { getConvexHull } from '../../../../shared/utils/geolocation-math';

@Component({
  selector: 'app-inspect-routine-current-plant-map',
  imports: [CommonModule],
  templateUrl: './inspect-routine-current-plant-map.html',
  host: {
    'style': 'display: contents'
  }
})
export class InspectRoutineCurrentPlantMap implements OnInit, AfterViewInit, OnDestroy {
  @Input() id!: number;

  private platformId = inject(PLATFORM_ID);
  private repository = inject(InspectRoutinePlantsRepository);
  private inspectRoutineRepository = inject(InspectRoutineRepository);
  private regionsRepository = inject(RegionsRepository);

  private map?: L.Map;
  private mapReady = signal<boolean>(false);
  private plantCircle?: L.Circle;
  private regionPolygon?: L.Polygon;

  constructor() {
    effect(() => {
      if (!this.mapReady()) return;
      const selectedPlant = this.repository.selectedInspectRoutinePlant();
      if (selectedPlant && selectedPlant.latitude && selectedPlant.longitude && this.map) {
        const coords: L.LatLngExpression = [selectedPlant.latitude, selectedPlant.longitude];

        this.map.setView(coords, this.map.getZoom());

        if (this.plantCircle) {
          this.plantCircle.setLatLng(coords);
        } else {
          this.plantCircle = L.circle(coords, {
            radius: 4,
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(this.map);
        }
      }
    });

    effect(() => {
      if (!this.mapReady() || !this.map || !this.id) return;

      const routines = this.inspectRoutineRepository.inspectRoutines();
      const routine = routines.find(r => r.id === this.id);

      if (routine && routine.region) {
        const allRegions = this.regionsRepository.regions();
        const regionPoints = allRegions.filter(reg =>
          reg.region.trim().toLowerCase() === routine.region?.trim().toLowerCase()
        );

        if (regionPoints.length > 0) {
          const rawCoords = regionPoints.map(p => [p.latitude, p.longitude] as [number, number]);
          const hullCoords = getConvexHull(rawCoords);

          if (this.regionPolygon) {
            this.regionPolygon.remove();
          }

          this.regionPolygon = L.polygon(hullCoords, {
            color: '#10b981',
            fillColor: '#10b981',
            fillOpacity: 0.2,
            weight: 2
          }).addTo(this.map);

          this.map.fitBounds(this.regionPolygon.getBounds(), { padding: [40, 40] });
        }
      }
    });
  }

  public async ngOnInit(): Promise<void> {
    await Promise.all([
      this.inspectRoutineRepository.fetchInspectRoutines(),
      this.regionsRepository.findAll()
    ]);
  }


  public ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
    }
  }

  public ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map-detail', {
      center: [-23.5505, -46.6333], // Default São Paulo center
      zoom: 15,
      zoomControl: false,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    // Initialize plant circle if a plant is already selected
    const selectedPlant = this.repository.selectedInspectRoutinePlant();
    if (selectedPlant && selectedPlant.latitude && selectedPlant.longitude) {
      const coords: L.LatLngExpression = [selectedPlant.latitude, selectedPlant.longitude];
      this.map.setView(coords, 15);
      this.plantCircle = L.circle(coords, {
        radius: 4,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(this.map);
    } else {
      // Example placeholder matching the previous implementation's behavior
      this.plantCircle = L.circle([-23.5505, -46.6333], {
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
}
