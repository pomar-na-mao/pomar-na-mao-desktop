import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { FarmBoundaryService } from '../../../../data/services/farm-boundary/farm-boundary-service';
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

  private map: L.Map | null = null;
  private boundaryLayer: L.Polygon | null = null;
  private plantsLayer: L.LayerGroup | null = null;
  private selectedMarker: L.CircleMarker | null = null;

  public availableParts = MIPD_PLANT_PARTS.map((part) => ({
    value: part,
    label: mipdPlantPartLabel(part),
  }));

  public get zoneOptions(): SelectOption[] {
    return [
      { label: 'Todos os talhões', value: '' },
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
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 20,
        attribution: 'Esri World Imagery',
      },
    ).addTo(this.map);

    this.plantsLayer = L.layerGroup().addTo(this.map);

    void this.loadFarmBoundary();
    this.renderPlantsOnMap();
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
            fillOpacity: 0.05,
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
        this.viewModel.selectPlant(plant.id);
        this.renderPlantsOnMap();
      });

      marker.addTo(this.plantsLayer);
    }
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
