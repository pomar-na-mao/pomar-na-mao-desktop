import { inject, Injectable, signal, effect } from '@angular/core';
import * as L from 'leaflet';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { SprayingOperationResponse } from '../../../domain/models/operations.model';

@Injectable()
export class OperationsViewModel {
  private operationsRepository = inject(OperationsRepository);
  private zonesRepository = inject(ZonesRepository);
  private plantsRepository = inject(PlantsRepository);

  public isMapFullscreen = signal(false);
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;
  private zonePolygonLayer: L.GeoJSON | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });

  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public selectedZoneId = signal<string>('');
  public selectedOperation = signal<string>('');
  public selectedOperationDetails = signal<SprayingOperationResponse | null>(null);

  public showPlants = signal<boolean>(false);
  public zonePlants = signal<any[]>([]);

  constructor() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    this.startDate.set(todayStr);
    this.endDate.set(todayStr);

    effect(() => {
      const type = this.selectedOperation();
      const start = this.startDate();
      const end = this.endDate();
      const zone = this.selectedZoneId();

      if (type === 'pulverizacao') {
        this.fetchSprayingOperations(start, end, zone);
      } else {
        this.operationsRepository.sprayingOperations.set([]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.drawOperations(this.operations());
    });

    effect(() => {
      const zoneId = this.selectedZoneId();
      this.renderZonePolygon(zoneId);
    });

    effect(() => {
      const zoneId = this.selectedZoneId();
      if (!zoneId) {
        this.showPlants.set(false);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const show = this.showPlants();
      const zoneId = this.selectedZoneId();

      if (show && zoneId) {
        this.fetchZonePlants(zoneId);
      } else {
        this.zonePlants.set([]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.renderPlants(this.zonePlants());
    });
  }

  private async fetchSprayingOperations(start: string, end: string, zone: string) {
    await this.operationsRepository.getSprayingOperations(
      start || null, 
      end || null, 
      zone || null
    );
  }

  public get operations() {
    return this.operationsRepository.sprayingOperations;
  }

  initMap(elementId: string): void {
    if (this.map) return;
    this.map = L.map(elementId, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 22,
    }).setView([-23.403, -49.149], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.zonePolygonLayer = L.geoJSON(undefined, {
      style: {
        color: '#3b82f6', // blue
        weight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
      },
    }).addTo(this.map);

    this.plantLayers = L.layerGroup().addTo(this.map);
    
    this.drawOperations(this.operations());
    this.renderZonePolygon(this.selectedZoneId());
  }

  private drawOperations(operations: SprayingOperationResponse[]) {
    if (!this.map) return;

    if (this.geoJsonLayer) {
      this.geoJsonLayer.remove();
      this.geoJsonLayer = null;
    }

    if (!operations || operations.length === 0) return;

    this.geoJsonLayer = L.geoJSON(undefined, {
      style: {
        color: '#f59e0b', // orange
        weight: 4,
        opacity: 0.7
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          this.selectedOperationDetails.set(feature.properties as SprayingOperationResponse);
        });
      }
    });

    operations.forEach(op => {
      if (op.route_geojson) {
        this.geoJsonLayer!.addData({
          type: 'Feature',
          geometry: op.route_geojson,
          properties: op
        } as any);
      }
    });

    this.geoJsonLayer.addTo(this.map);

    try {
      if (operations.length > 0) {
        this.map.fitBounds(this.geoJsonLayer.getBounds());
      }
    } catch (e) {}
  }

  private renderZonePolygon(zoneId: string): void {
    if (!this.zonePolygonLayer || !this.map) {
      return;
    }

    this.zonePolygonLayer.clearLayers();

    if (!zoneId) {
      return;
    }

    const zone = this.zonesRepository.zones().find((z) => z.id === zoneId);
    if (!zone?.polygon) {
      return;
    }

    this.zonePolygonLayer.addData(zone.polygon as any);

    const polygonBounds = this.zonePolygonLayer.getBounds();
    if (polygonBounds.isValid()) {
      this.map.fitBounds(polygonBounds, { padding: [48, 48], maxZoom: 18 });
    }
  }

  setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  invalidateMapSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  toggleFullscreen() {
    this.setMapFullscreen(!this.isMapFullscreen());
  }

  private async fetchZonePlants(zoneId: string) {
    const plants = await this.plantsRepository.queryPlants({ zoneId });
    this.zonePlants.set(plants);
  }

  private renderPlants(plants: any[]): void {
    if (!this.map || !this.plantLayers) {
      return;
    }

    this.plantLayers.clearLayers();

    if (plants.length === 0) {
      return;
    }

    plants.forEach((plant) => {
      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 9,
        color: '#34d399', // green border
        fillColor: '#10b981', // green fill
        fillOpacity: 0.9,
        weight: 0.75,
        renderer: this.plantRenderer,
      })
        .bindPopup(
          `
            <div style="font-family: sans-serif; font-size: 12px; min-width: 140px">
              ID: ${plant.id}<br/>
              ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
            </div>
          `,
        )
        .addTo(this.plantLayers!);
    });
  }
}
