import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { FarmBoundaryService } from '../../../../data/services/farm-boundary/farm-boundary-service';
import { ZonesRepository } from '../../../../data/repositories/zones/zones-repository';
import { RegionsRepository } from '../../../../data/repositories/regions/regions-repository';
import {
  MIPD_PLANT_PARTS,
  mipdPlantPartLabel,
  type MipdPlantPart,
} from '../../../../domain/models/mipd-operation.model';
import { Input } from '../../../../shared/components/input/input';
import {
  Select,
  type SelectOption,
} from '../../../../shared/components/select/select';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../../shared/utils/ordered-map-boundary';
import { MipdRegistrationViewModel } from '../../../view-models/mipd/mipd-registration.view-model';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];

const ZONE_POLYGON_COLORS = [
  '#0ea5e9', // Azul celeste vibrante
  '#f97316', // Laranja vibrante
  '#ec4899', // Rosa pink vivo
  '#eab308', // Amarelo ouro brilhante
  '#a855f7', // Roxo elétrico
  '#10b981', // Esmeralda brilhante
  '#3b82f6', // Azul royal vivo
  '#ef4444', // Vermelho vivo
  '#14b8a6', // Turquesa vivo
  '#84cc16', // Lima neon
  '#f43f5e', // Carmesim vibrante
  '#8b5cf6', // Violeta intenso
  '#06b6d4', // Ciano vivo
  '#d97706', // Âmbar saturado
  '#c026d3', // Magenta fúcsia
  '#0284c7', // Azul cerúleo brilhante
];

@Component({
  selector: 'app-mipd-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, Input, Select],
  providers: [MipdRegistrationViewModel],
  templateUrl: './mipd-registration.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class MipdRegistration implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  public viewModel = inject(MipdRegistrationViewModel);
  private farmBoundaryService = inject(FarmBoundaryService);
  private zonesRepository = inject(ZonesRepository, { optional: true });
  private regionsRepository = inject(RegionsRepository, { optional: true });

  private map: L.Map | null = null;
  private boundaryLayer: L.Polygon | null = null;
  private zonesLayer: L.LayerGroup | null = null;
  private plantsLayer: L.LayerGroup | null = null;
  private selectedMarker: L.CircleMarker | null = null;

  public availableParts = MIPD_PLANT_PARTS.map((part) => ({
    value: part,
    label: mipdPlantPartLabel(part),
  }));

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todas as zonas', value: '' },
      ...this.viewModel.zones().map((z) => ({
        label: z.name,
        value: z.id,
      })),
    ];
  }

  public get occurrenceTypeOptions(): SelectOption[] {
    return this.viewModel.occurrenceTypes().map((occ) => ({
      label: occ.name,
      value: occ.id,
    }));
  }

  public get plantOptions(): SelectOption[] {
    return this.viewModel.plants().map((p) => {
      const zone = p.zone_name ? ` [${p.zone_name}]` : '';
      const variety = p.variety_name ? ` (${p.variety_name})` : '';
      return {
        label: `Planta ${p.id.slice(0, 8)}${zone}${variety}`,
        value: p.id,
      };
    });
  }

  public ngOnInit(): void {
    void this.viewModel.initialize().then(() => {
      void this.loadZones();
      this.renderPlantsOnMap();
    });
  }

  public ngAfterViewInit(): void {
    this.initMap();
  }

  public ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      center: DEFAULT_CENTER,
      zoom: 15,
      maxZoom: 22,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 22,
        maxNativeZoom: 18,
        attribution: 'Esri World Imagery',
      },
    ).addTo(this.map);

    this.zonesLayer = L.layerGroup().addTo(this.map);
    this.plantsLayer = L.layerGroup().addTo(this.map);

    void this.loadFarmBoundary();
    void this.loadZones();
    this.renderPlantsOnMap();
  }

  private async loadZones(): Promise<void> {
    try {
      if (this.zonesRepository && this.zonesRepository.zones().length === 0) {
        await this.zonesRepository.findAll();
      }
      if (this.regionsRepository && this.regionsRepository.regions().length === 0) {
        await this.regionsRepository.findAll();
      }
      this.renderZonesOnMap();
    } catch {
      // Ignora erro no carregamento das zonas
    }
  }

  public renderZonesOnMap(): void {
    if (!this.map || !this.zonesLayer) return;
    this.zonesLayer.clearLayers();

    const zones = this.zonesRepository?.zones() ?? [];
    const regions = this.regionsRepository?.regions() ?? [];
    if (zones.length === 0) return;

    const regionCoordinates = new Map<
      string,
      Array<{ latitude: number; longitude: number; order: number }>
    >();

    regions.forEach((region) => {
      const order = Number(region.order);
      if (
        !region.zone_id ||
        !Number.isFinite(region.latitude) ||
        !Number.isFinite(region.longitude) ||
        !Number.isFinite(order)
      ) {
        return;
      }
      const points = regionCoordinates.get(region.zone_id) ?? [];
      points.push({ latitude: region.latitude, longitude: region.longitude, order });
      regionCoordinates.set(region.zone_id, points);
    });

    zones.forEach((zone, index) => {
      const orderedRegion = (regionCoordinates.get(zone.id) ?? [])
        .sort((left, right) => left.order - right.order)
        .map(({ latitude, longitude }) => [latitude, longitude] as L.LatLngTuple);

      const coordinates =
        orderedRegion.length >= 3
          ? orderedRegion
          : this.parseZonePolygon(zone.polygon);

      if (!coordinates || coordinates.length < 3) return;

      const color = ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length];
      L.polygon(coordinates, {
        color,
        weight: 3.5,
        opacity: 1,
        fill: false,
        fillOpacity: 0,
        interactive: false,
      }).addTo(this.zonesLayer!);
    });
  }

  private parseZonePolygon(
    polygon: Record<string, unknown> | null | undefined,
  ): L.LatLngTuple[] | null {
    if (!polygon || polygon['type'] !== 'Polygon') return null;
    const rings = polygon['coordinates'];
    if (!Array.isArray(rings) || !Array.isArray(rings[0])) return null;

    const coords = (rings[0] as unknown[])
      .map((pt): L.LatLngTuple | null => {
        if (!Array.isArray(pt) || pt.length < 2) return null;
        const [lng, lat] = pt;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return [lat as number, lng as number];
      })
      .filter((pt): pt is L.LatLngTuple => pt !== null);

    return coords.length >= 3 ? coords : null;
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      if (points.length >= 3 && this.map) {
        const boundary = buildOrderedMapBoundary(points);
        if (boundary && boundary.latLngs.length >= 3) {
          const latLngs = boundary.latLngs as L.LatLngTuple[];
          this.boundaryLayer = L.polygon(latLngs, {
            color: '#ffffff',
            weight: 2,
            fill: false,
            fillOpacity: 0,
            dashArray: '4, 4',
          }).addTo(this.map);

          this.map.fitBounds(this.boundaryLayer.getBounds(), { padding: [20, 20] });
        }
      }
    } catch {
      // Ignora erro no carregamento do contorno se não houver dados
    }
  }

  public renderPlantsOnMap(): void {
    if (!this.map || !this.plantsLayer) return;

    this.plantsLayer.clearLayers();
    const plants = this.viewModel.plants();
    const selectedId = this.viewModel.selectedPlantId();

    for (const plant of plants) {
      const isSelected = plant.id === selectedId;
      const marker = L.circleMarker([plant.latitude, plant.longitude], {
        radius: isSelected ? 8 : 4,
        fillColor: isSelected ? '#a855f7' : '#22c55e',
        color: isSelected ? '#ffffff' : '#15803d',
        weight: isSelected ? 2.5 : 1,
        fillOpacity: 0.85,
      });

      marker.on('click', () => {
        if (this.viewModel.selectedPlantId() === plant.id) {
          this.deselectPlant();
        } else {
          this.viewModel.selectPlant(plant.id);
          this.renderPlantsOnMap();
        }
      });

      marker.addTo(this.plantsLayer);
    }
  }

  @HostListener('window:keydown', ['$event'])
  public handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.viewModel.selectedPlantId()) {
        event.preventDefault();
        this.deselectPlant();
      }
      return;
    }

    if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z')) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;
      if (isInput && activeEl.type !== 'button' && activeEl.type !== 'submit') {
        return;
      }

      if (this.viewModel.selectedPlantId()) {
        event.preventDefault();
        this.deselectPlant();
      }
    }
  }

  public deselectPlant(): void {
    this.viewModel.selectPlant('');
    this.renderPlantsOnMap();
  }

  public onZoneChange(zoneId: string): void {
    void this.viewModel.onZoneChange(zoneId).then(() => {
      this.renderPlantsOnMap();
    });
  }

  public onPlantChange(plantId: string): void {
    this.viewModel.selectPlant(plantId);
    this.renderPlantsOnMap();

    const plant = this.viewModel.plants().find((p) => p.id === plantId);
    if (plant && this.map) {
      this.map.setView([plant.latitude, plant.longitude], 18, { animate: true });
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.viewModel.setPhoto(input.files[0]);
    }
  }

  public async submitForm(form: NgForm): Promise<void> {
    form.control.markAllAsTouched();
    const saved = await this.viewModel.submit();
    if (saved) {
      this.renderPlantsOnMap();
    }
  }
}
