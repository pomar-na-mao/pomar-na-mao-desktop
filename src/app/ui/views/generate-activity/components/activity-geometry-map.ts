import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import * as L from 'leaflet';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import type {
  ActivityCoordinate,
  ActivityGeometryType,
  ActivityMapZone,
} from '../../../../domain/models/activity-entry.model';
import type { PlantMapItem } from '../../../../domain/models/plant-data.model';

const ZONE_POLYGON_COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#3b82f6',
  '#f97316',
  '#06b6d4',
  '#a855f7',
  '#e11d48',
  '#65a30d',
  '#4f46e5',
  '#dc2626',
  '#0891b2',
  '#16a34a',
  '#ca8a04',
  '#c026d3',
  '#0284c7',
  '#db2777',
  '#059669',
  '#d97706',
];

@Component({
  selector: 'app-activity-geometry-map',
  imports: [NgClass, ButtonModule, TooltipModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div
      class="relative flex h-full w-full flex-col overflow-hidden bg-surface-0 text-surface-900 transition-colors dark:bg-surface-900 dark:text-surface-0"
    >
      <div
        class="z-10 flex shrink-0 items-center justify-between bg-surface-0 px-3 py-1.5 transition-colors dark:bg-surface-900"
      >
        <div class="flex items-center gap-3">
          <span
            class="hidden text-xs font-medium text-surface-600 transition-colors dark:text-surface-400 sm:inline"
          >
            Geometria da atividade
          </span>
          <div
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
            [ngClass]="
              drawing || hasGeometry
                ? 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-300'
                : 'border-surface-200 bg-surface-100 text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-400'
            "
          >
            <span
              class="h-2 w-2 rounded-full transition-colors"
              [ngClass]="
                drawing
                  ? 'animate-pulse bg-primary-500'
                  : hasGeometry
                    ? 'bg-primary-500'
                    : 'bg-surface-400'
              "
            ></span>
            {{
              drawing
                ? 'Desenhando (' + points.length + ' pontos)'
                : hasGeometry
                  ? geometryLabel + ' selecionada'
                  : 'Aguardando'
            }}
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <p-button
            icon="pi pi-undo"
            size="small"
            [text]="true"
            [rounded]="true"
            severity="secondary"
            [disabled]="!drawing || points.length === 0"
            (onClick)="undo()"
            aria-label="Desfazer último ponto"
            pTooltip="Desfazer último ponto"
            tooltipPosition="bottom"
          />
          <p-button
            icon="pi pi-check"
            label="Finalizar"
            size="small"
            severity="primary"
            [disabled]="!canFinish"
            (onClick)="completeDrawing()"
            aria-label="Finalizar geometria"
            pTooltip="Finalizar geometria"
            tooltipPosition="bottom"
          />
          <p-button
            [icon]="drawing ? 'pi pi-times' : 'pi pi-pencil'"
            [label]="drawing ? 'Cancelar' : 'Desenhar'"
            size="small"
            [severity]="drawing ? 'danger' : 'info'"
            (onClick)="toggleDrawing()"
            [aria-label]="
              drawing ? 'Cancelar desenho' : 'Desenhar nova geometria'
            "
            [pTooltip]="
              drawing ? 'Cancelar desenho' : 'Desenhar nova geometria'
            "
            tooltipPosition="bottom"
          />
          <p-button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            [text]="true"
            [rounded]="true"
            [disabled]="!hasGeometry && !drawing"
            (onClick)="clear()"
            aria-label="Limpar desenho"
            pTooltip="Limpar tudo"
            tooltipPosition="bottom"
          />
        </div>
      </div>

      <div
        #mapContainer
        class="map-container flex-1 dark:[filter:invert(0.9)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)]"
        aria-label="Mapa para desenhar a atividade"
      ></div>

      @if (drawing) {
        <div
          class="absolute bottom-4 left-1/2 z-[1000] flex -translate-x-1/2 animate-bounce items-center gap-2 rounded-full border border-white/20 bg-emerald-600/90 px-4 py-2 text-[11px] font-medium text-white shadow-lg backdrop-blur-md"
        >
          <i class="pi pi-info-circle" aria-hidden="true"></i>
          Clique uma vez e mova o mouse para desenhar. Clique duplo no ponto
          final.
        </div>
      }
    </div>
  `,
})
export class ActivityGeometryMap
  implements AfterViewInit, OnChanges, OnDestroy
{
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLElement>;
  @Input() geometryType: ActivityGeometryType = 'area';
  @Input() boundary: Array<{ latitude: number; longitude: number }> = [];
  @Input() zones: ActivityMapZone[] = [];
  @Input() plants: PlantMapItem[] = [];
  @Input() clearSignal = 0;
  @Output() geometryChange = new EventEmitter<ActivityCoordinate[]>();

  private zone = inject(NgZone);
  private map?: L.Map;
  private boundaryLayer?: L.Polygon;
  private zoneLayers: L.Polygon[] = [];
  private zoneBorderLayers: L.Polygon[] = [];
  private zoneBorderHaloLayers: L.Polygon[] = [];
  private plantLayers: L.CircleMarker[] = [];
  private canvasRenderer = L.canvas({ pane: 'activityPlants', padding: 0.5 });
  private geometryLayer?: L.Polyline | L.Polygon;
  private pointLayers: L.CircleMarker[] = [];
  private restoreDoubleClickZoom = false;
  private readonly freehandMinimumDistanceMeters = 1;
  public drawing = false;
  public points: ActivityCoordinate[] = [];

  public get minimumPoints(): number {
    return this.geometryType === 'route' ? 2 : 3;
  }

  public get hasGeometry(): boolean {
    return this.points.length >= this.minimumPoints;
  }

  public get canFinish(): boolean {
    return this.drawing && this.hasGeometry;
  }

  public get geometryLabel(): string {
    return this.geometryType === 'route' ? 'Rota' : 'Área';
  }

  public ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-23.398772, -49.148646],
      zoom: 16,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 24,
    }).addTo(this.map);
    this.map.createPane('activityZones');
    const zonesPane = this.map.getPane('activityZones');
    if (zonesPane) zonesPane.style.zIndex = '350';
    this.map.createPane('activityPlants');
    const plantsPane = this.map.getPane('activityPlants');
    if (plantsPane) plantsPane.style.zIndex = '360';
    this.map.createPane('activityZoneBorders');
    const zoneBordersPane = this.map.getPane('activityZoneBorders');
    if (zoneBordersPane) zoneBordersPane.style.zIndex = '370';
    this.map.on('click', (event: L.LeafletMouseEvent) =>
      this.zone.run(() => this.addDrawingPoint(event.latlng)),
    );
    this.map.on('mousemove', (event: L.LeafletMouseEvent) => {
      if (!this.drawing || this.points.length === 0) return;
      this.zone.run(() => this.addDrawingPoint(event.latlng));
    });
    this.map.on('dblclick', (event: L.LeafletMouseEvent) => {
      if (!this.drawing) return;
      L.DomEvent.stopPropagation(event);
      this.zone.run(() => {
        this.addDrawingPoint(event.latlng);
        this.completeDrawing();
      });
    });
    this.renderZones();
    this.renderPlants();
    this.renderBoundary();
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearSignal'] && !changes['clearSignal'].firstChange)
      this.clear();
    if (changes['zones'] && this.map) this.renderZones();
    if (changes['plants'] && this.map) this.renderPlants();
    if (changes['boundary'] && this.map) this.renderBoundary();
    if (changes['geometryType'] && !changes['geometryType'].firstChange)
      this.clear();
  }

  public ngOnDestroy(): void {
    this.map?.remove();
  }

  public toggleDrawing(): void {
    if (this.drawing) {
      this.clear();
      return;
    }

    if (this.points.length > 0) {
      this.points = [];
      this.renderGeometry();
      this.geometryChange.emit([]);
    }
    this.drawing = true;
    if (!this.map) return;
    this.map.getContainer().style.cursor = 'crosshair';
    this.restoreDoubleClickZoom = this.map.doubleClickZoom.enabled();
    this.map.doubleClickZoom.disable();
  }

  public completeDrawing(): void {
    if (!this.canFinish) return;
    this.drawing = false;
    if (this.map) this.map.getContainer().style.cursor = '';
    this.restoreMapDoubleClickZoom();
  }

  public undo(): void {
    if (this.points.length === 0) return;
    this.points = this.points.slice(0, -1);
    this.renderGeometry();
    this.geometryChange.emit(this.points);
  }

  public clear(): void {
    this.points = [];
    this.drawing = false;
    if (this.map) this.map.getContainer().style.cursor = '';
    this.restoreMapDoubleClickZoom();
    this.renderGeometry();
    this.geometryChange.emit([]);
  }

  private addDrawingPoint(point: L.LatLng): void {
    if (!this.drawing || this.points.length >= 2000) return;
    const lastPoint = this.points[this.points.length - 1];
    if (
      lastPoint &&
      L.latLng(lastPoint[1], lastPoint[0]).distanceTo(point) <
        this.freehandMinimumDistanceMeters
    ) {
      return;
    }

    this.points = [
      ...this.points,
      [Number(point.lng.toFixed(6)), Number(point.lat.toFixed(6))],
    ];
    this.renderGeometry();
    this.geometryChange.emit(this.points);
  }

  private restoreMapDoubleClickZoom(): void {
    if (this.restoreDoubleClickZoom) this.map?.doubleClickZoom.enable();
    this.restoreDoubleClickZoom = false;
  }

  private renderBoundary(): void {
    if (!this.map) return;
    this.boundaryLayer?.remove();
    const coordinates = this.boundary
      .filter(
        (point) =>
          Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
      )
      .map((point) => [point.latitude, point.longitude] as L.LatLngTuple);
    if (coordinates.length < 3) return;
    this.boundaryLayer = L.polygon(coordinates, {
      color: '#16a34a',
      fillColor: '#22c55e',
      fillOpacity: 0.08,
      dashArray: '6 6',
      weight: 2,
      interactive: false,
    }).addTo(this.map);
    this.map.fitBounds(this.boundaryLayer.getBounds(), {
      padding: [32, 32],
      maxZoom: 18,
    });
  }

  private renderZones(): void {
    this.zoneLayers.forEach((layer) => layer.remove());
    this.zoneBorderLayers.forEach((layer) => layer.remove());
    this.zoneBorderHaloLayers.forEach((layer) => layer.remove());
    this.zoneLayers = [];
    this.zoneBorderLayers = [];
    this.zoneBorderHaloLayers = [];
    if (!this.map) return;

    this.zoneLayers = this.zones
      .map((zone, index) => {
        const coordinates = zone.coordinates
          .filter(
            (point) =>
              Number.isFinite(point.latitude) &&
              Number.isFinite(point.longitude),
          )
          .map((point) => [point.latitude, point.longitude] as L.LatLngTuple);
        if (coordinates.length < 3) return null;

        const color = ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length];
        const fillLayer = L.polygon(coordinates, {
          pane: 'activityZones',
          stroke: false,
          fillColor: color,
          fillOpacity: 0.16,
          interactive: false,
        }).addTo(this.map!);

        this.zoneBorderHaloLayers.push(
          L.polygon(coordinates, {
            pane: 'activityZoneBorders',
            color: '#ffffff',
            fill: false,
            opacity: 0.9,
            weight: 5,
            interactive: false,
          }).addTo(this.map!),
        );
        this.zoneBorderLayers.push(
          L.polygon(coordinates, {
            pane: 'activityZoneBorders',
            color,
            fill: false,
            opacity: 1,
            weight: 3,
            interactive: false,
          }).addTo(this.map!),
        );

        return fillLayer;
      })
      .filter((layer): layer is L.Polygon => layer !== null);
  }

  private renderPlants(): void {
    this.plantLayers.forEach((layer) => layer.remove());
    this.plantLayers = [];
    if (!this.map) return;

    this.plantLayers = this.plants
      .filter(
        (plant) =>
          Number.isFinite(plant.latitude) && Number.isFinite(plant.longitude),
      )
      .map((plant) => {
        const hasZone = Boolean(plant.zone_id || plant.zoneId);
        const strokeColor =
          plant.strokeColor ?? plant.color ?? (hasZone ? '#047857' : '#4b5563');
        const fillColor = plant.fillColor ?? (hasZone ? '#10b981' : '#9ca3af');

        return L.circleMarker([plant.latitude, plant.longitude], {
          pane: 'activityPlants',
          renderer: this.canvasRenderer,
          radius: 4,
          color: strokeColor,
          fillColor,
          fillOpacity: 0.85,
          weight: 0.75,
          interactive: false,
        }).addTo(this.map!);
      });
  }

  private renderGeometry(): void {
    this.geometryLayer?.remove();
    this.geometryLayer = undefined;
    this.pointLayers.forEach((point) => point.remove());
    this.pointLayers = [];
    if (!this.map || this.points.length === 0) return;

    const latLngs = this.points.map(
      ([longitude, latitude]) => [latitude, longitude] as L.LatLngTuple,
    );
    const markerPoints =
      latLngs.length === 1
        ? latLngs
        : [latLngs[0], latLngs[latLngs.length - 1]];
    this.pointLayers = markerPoints.map((point) =>
      L.circleMarker(point, {
        radius: 5,
        color: '#ffffff',
        fillColor: '#2563eb',
        fillOpacity: 1,
        weight: 2,
      }).addTo(this.map!),
    );
    this.geometryLayer =
      this.geometryType === 'area' && latLngs.length >= 3
        ? L.polygon(latLngs, {
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
            weight: 3,
          }).addTo(this.map)
        : L.polyline(latLngs, { color: '#2563eb', weight: 4 }).addTo(this.map);
  }
}
