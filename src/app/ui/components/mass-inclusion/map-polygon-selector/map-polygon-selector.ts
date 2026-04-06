import { CommonModule } from '@angular/common';
import {
    Component,
    OnDestroy,
    Output,
    EventEmitter,
    Input,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import type { Plant } from '../../../../domain/models/plant-data.model';
import type { PolygonSelection } from '../../../../domain/models/mass-inclusion';
import type { PolygonCoordinate } from '../../../../domain/models/mass-inclusion';

@Component({
    selector: 'app-map-polygon-selector',
    imports: [CommonModule, TranslateModule],
    templateUrl: './map-polygon-selector.html',
    styleUrls: ['./map-polygon-selector.scss'],
})
export class MapPolygonSelectorComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('mapContainer') mapContainer!: ElementRef;

    @Input() center: [number, number] = [-23.398772, -49.148646];

    @Input() zoom: number = 32;

    @Input() maxPolygons: number = 1;

    @Input() set plants(plants: Plant[]) {
        this._plants = plants;
        this.renderPlantCircles();
    }

    @Input() clearSignal: number = 0;

    @Input() set backgroundPolygon(coords: [number, number][] | null) {
        this._backgroundPolygonCoords = coords;
        this.renderBackgroundPolygon();
    }

    @Output() polygonSelected = new EventEmitter<PolygonSelection>();

    @Output() polygonCleared = new EventEmitter<void>();

    private map!: L.Map;
    private drawnLayers: L.Polygon[] = [];
    private tempPoints: L.LatLng[] = [];
    private tempMarkers: L.CircleMarker[] = [];
    private tempPolyline: L.Polyline | null = null;
    private isDrawing = false;
    private previewLine: L.Polyline | null = null;
    private _backgroundPolygonCoords: [number, number][] | null = null;
    private _plants: Plant[] = [];
    private backgroundLayer: L.Polygon | null = null;
    private plantCircles: L.Circle[] = [];

    public drawingMode = false;
    public polygons: PolygonSelection[] = [];
    public selectedPolygonCoords: PolygonCoordinate[] = [];
    public showCoords = false;
    public copiedFeedback = false;

    public ngAfterViewInit(): void {
        this.initMap();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['clearSignal'] && !changes['clearSignal'].firstChange) {
            this.clearAll();
        }
    }

    public ngOnDestroy(): void {
        if (this.map) this.map.remove();
    }

    private initMap(): void {
        this.map = L.map(this.mapContainer.nativeElement, {
            center: this.center,
            zoom: this.zoom,
            zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 24,
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
        this.map.on('mousemove', (e: L.LeafletMouseEvent) => this.onMouseMove(e));
        this.map.on('dblclick', (e: L.LeafletMouseEvent) => this.finishPolygon(e));

        if (this._backgroundPolygonCoords) {
            this.renderBackgroundPolygon();
        }

        this.renderPlantCircles();
    }

    private renderBackgroundPolygon(): void {
        if (!this.map) return;

        if (this.backgroundLayer) {
            this.map.removeLayer(this.backgroundLayer);
            this.backgroundLayer = null;
        }

        if (this._backgroundPolygonCoords && this._backgroundPolygonCoords.length > 0) {
            this.backgroundLayer = L.polygon(this._backgroundPolygonCoords, {
                color: '#dc2626', // red-500
                fillColor: '#dc2626', // red-400
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5',
                interactive: false,
            }).addTo(this.map);

            this.map.fitBounds(this.backgroundLayer.getBounds(), { padding: [40, 40] });
        }
    }

    private renderPlantCircles(): void {
        if (!this.map) return;

        this.plantCircles.forEach((circle) => circle.remove());
        this.plantCircles = [];

        this._plants.forEach((plant) => {
            const circle = L.circle([plant.latitude, plant.longitude], {
                radius: 4,
                color: '#166534',
                fillColor: '#22c55e',
                fillOpacity: 0.9,
                weight: 2,
                interactive: false,
            }).addTo(this.map);

            this.plantCircles.push(circle);
        });
    }

    public toggleDrawingMode(): void {
        this.drawingMode = !this.drawingMode;
        this.map.getContainer().style.cursor = this.drawingMode ? 'crosshair' : '';

        if (!this.drawingMode) {
            this.cancelDrawing();
        }
    }

    private onMapClick(e: L.LeafletMouseEvent): void {
        if (!this.drawingMode) return;

        L.DomEvent.stopPropagation(e);
        this.tempPoints.push(e.latlng);

        const marker = L.circleMarker(e.latlng, {
            radius: 6,
            fillColor: '#00d4ff',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
        }).addTo(this.map);

        this.tempMarkers.push(marker);

        if (this.tempPoints.length > 1) {
            if (this.tempPolyline) {
                this.tempPolyline.setLatLngs(this.tempPoints);
            } else {
                this.tempPolyline = L.polyline(this.tempPoints, {
                    color: '#00d4ff',
                    weight: 2,
                    dashArray: '6, 4',
                    opacity: 0.8,
                }).addTo(this.map);
            }
        }
    }

    private onMouseMove(e: L.LeafletMouseEvent): void {
        if (!this.drawingMode || this.tempPoints.length === 0) return;

        const points = [...this.tempPoints, e.latlng];

        if (this.previewLine) {
            this.previewLine.setLatLngs(points);
        } else {
            this.previewLine = L.polyline(points, {
                color: '#00d4ff',
                weight: 1.5,
                dashArray: '4, 6',
                opacity: 0.5,
            }).addTo(this.map);
        }
    }

    private finishPolygon(e: L.LeafletMouseEvent): void {
        if (!this.drawingMode || this.tempPoints.length < 3) return;

        L.DomEvent.stopPropagation(e);
        this.completePolygon();
    }

    public completePolygon(): void {
        if (this.tempPoints.length < 3) return;

        this.clearTempLayers();

        if (this.drawnLayers.length >= this.maxPolygons) {
            this.drawnLayers.forEach((l) => this.map.removeLayer(l));
            this.drawnLayers = [];
            this.polygons = [];
        }

        const polygon = L.polygon(this.tempPoints, {
            color: '#00d4ff',
            fillColor: '#00d4ff',
            fillOpacity: 0.15,
            weight: 2,
        }).addTo(this.map);

        this.drawnLayers.push(polygon);

        const coordinates: PolygonCoordinate[] = this.tempPoints.map((p) => ({
            lat: parseFloat(p.lat.toFixed(6)),
            lng: parseFloat(p.lng.toFixed(6)),
        }));

        const geoJson = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [...coordinates.map((c) => [c.lng, c.lat]), [coordinates[0].lng, coordinates[0].lat]],
                ],
            },
            properties: {},
        };

        const selection: PolygonSelection = { coordinates, geoJson };
        this.polygons.push(selection);
        this.selectedPolygonCoords = coordinates;

        this.polygonSelected.emit(selection);

        this.tempPoints = [];
        this.drawingMode = false;
        this.map.getContainer().style.cursor = '';
    }

    public cancelDrawing(): void {
        this.clearTempLayers();
        this.tempPoints = [];
        this.isDrawing = false;
    }

    private clearTempLayers(): void {
        this.tempMarkers.forEach((m) => this.map.removeLayer(m));
        this.tempMarkers = [];

        if (this.tempPolyline) {
            this.map.removeLayer(this.tempPolyline);
            this.tempPolyline = null;
        }

        if (this.previewLine) {
            this.map.removeLayer(this.previewLine);
            this.previewLine = null;
        }
    }

    public clearAll(): void {
        this.cancelDrawing();
        this.drawnLayers.forEach((l) => this.map.removeLayer(l));
        this.drawnLayers = [];
        this.polygons = [];
        this.selectedPolygonCoords = [];
        this.drawingMode = false;
        this.map.getContainer().style.cursor = '';
        this.polygonCleared.emit();
    }

    public undoLastPoint(): void {
        if (this.tempPoints.length === 0) return;

        this.tempPoints.pop();
        const lastMarker = this.tempMarkers.pop();
        if (lastMarker) this.map.removeLayer(lastMarker);

        if (this.tempPoints.length <= 1 && this.tempPolyline) {
            this.map.removeLayer(this.tempPolyline);
            this.tempPolyline = null;
        } else if (this.tempPolyline) {
            this.tempPolyline.setLatLngs(this.tempPoints);
        }
    }

    public copyCoordinates(): void {
        const text = JSON.stringify(this.selectedPolygonCoords, null, 2);

        navigator.clipboard.writeText(text).then(() => {
            this.copiedFeedback = true;
            setTimeout(() => (this.copiedFeedback = false), 2000);
        });
    }

    public copyGeoJson(): void {
        if (this.polygons.length === 0) return;

        const text = JSON.stringify(this.polygons[this.polygons.length - 1].geoJson, null, 2);

        navigator.clipboard.writeText(text).then(() => {
            this.copiedFeedback = true;
            setTimeout(() => (this.copiedFeedback = false), 2000);
        });
    }

    get pointsCount(): number {
        return this.tempPoints.length;
    }

    get hasPolygon(): boolean {
        return this.selectedPolygonCoords.length > 0;
    }
}
