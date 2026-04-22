import {
    Component,
    AfterViewInit,
    OnDestroy,
    OnInit,
    inject,
    PLATFORM_ID,
    ElementRef,
    effect,
    signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
import * as L from 'leaflet';
import type { BooleanKeys, Plant } from '../../../../domain/models/plant-data.model';
import type { Region } from '../../../../domain/models/regions.model';
import { AppSelect } from '../../../../shared/components';
import { getConvexHull } from '../../../../shared/utils/geolocation-math';
import { getRandomColor } from '../../../../shared/utils/colors';
import { FarmOverviewMapViewModel } from '../../../view-models/farm-overview-map/farm-overview-map.view-model';
import { RegionsRepository } from '../../../../data/repositories/regions/regions-repository';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { PlantsRepository } from '../../../../data/repositories/plants/plants-repository';
import { PlantDetailModalComponent, type PlantDetailInput } from '../../plant-detail-modal/plant-detail-modal';

@Component({
    selector: 'app-farm-overview-map',
    imports: [CommonModule, AppSelect, PlantDetailModalComponent],
    templateUrl: './farm-overview-map.html',
    styleUrls: ['./farm-overview-map.scss'],
})
export class FarmOverviewMap implements OnInit, AfterViewInit, OnDestroy {
    private map?: L.Map;
    private tileLayer?: L.TileLayer;
    private regionPolygons: Map<string, L.Polygon> = new Map();
    private plantCircles: L.Circle[] = [];
    private assignedColors: Map<string, string> = new Map();
    private platformId = inject(PLATFORM_ID);
    private elRef = inject(ElementRef);
    public farmOverviewMapViewModel = inject(FarmOverviewMapViewModel);
    private regionsRepository = inject(RegionsRepository);
    private plantsRepository = inject(PlantsRepository);
    private themeService = inject(ThemeService);

    public selectedRegionId = signal('');
    public selectedOccurrenceKey = signal<BooleanKeys | ''>('');
    public selectedVariety = signal('');

    public selectedPlant = signal<PlantDetailInput | null>(null);
    public isLoadingPlant = signal(false);

    private defaultZoom = 15;

    constructor() {
        effect(() => {
            const regionId = this.selectedRegionId();
            const region = this.farmOverviewMapViewModel.findRegionById(regionId);
            if (region) {
                this.focusRegion(region);
            }
        });

        effect(() => {
            const regionId = this.selectedRegionId();
            const region = this.farmOverviewMapViewModel.findRegionById(regionId);
            this.farmOverviewMapViewModel.loadPlants(
                region?.region ?? '',
                this.selectedOccurrenceKey(),
                this.selectedVariety()
            );
        });

        effect(() => {
            if (this.farmOverviewMapViewModel.regionsGroupedByName().size > 0) {
                this.renderPolygons();
                this.fitAllRegions();
            }
        });

        effect(() => {
            this.renderPlantCircles(this.farmOverviewMapViewModel.plants());
        });

        effect(() => {
            const isDark = this.themeService.currentTheme() === 'dark';
            const container = this.elRef.nativeElement.querySelector('#map') as HTMLElement | null;
            if (container) {
                container.classList.toggle('map-dark', isDark);
            }
        });
    }

    async ngOnInit() {
        await this.farmOverviewMapViewModel.loadRegions();
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.initMap();
            this.renderPolygons();
            this.fitAllRegions();
        }
    }

    ngOnDestroy() {
        if (this.map) {
            this.map.remove();
        }
    }

    public onRegionChange(regionId: string | string[]): void {
        const id = Array.isArray(regionId) ? regionId[0] : regionId;
        this.selectedRegionId.set(id);
        const region = this.farmOverviewMapViewModel.findRegionById(id);
        this.regionsRepository.currentRegion.set(region ?? null);
    }

    public onOccurrenceChange(occurrenceKey: string | string[]): void {
        const key = Array.isArray(occurrenceKey) ? occurrenceKey[0] : occurrenceKey;
        this.selectedOccurrenceKey.set(key as BooleanKeys | '');
    }

    public onVarietyChange(variety: string | string[]): void {
        const value = Array.isArray(variety) ? variety[0] : variety;
        this.selectedVariety.set(value);
    }

    public closePlantDetail(): void {
        this.selectedPlant.set(null);
    }

    private async onPlantCircleClick(plantId: string): Promise<void> {
        this.isLoadingPlant.set(true);
        try {
            const plant = await this.plantsRepository.findById(plantId);
            if (plant) {
                this.selectedPlant.set(plant as PlantDetailInput);
            }
        } finally {
            this.isLoadingPlant.set(false);
        }
    }

    private renderPolygons(): void {
        if (!this.map || !isPlatformBrowser(this.platformId)) return;

        this.regionPolygons.forEach((polygon) => polygon.remove());
        this.regionPolygons.clear();

        this.farmOverviewMapViewModel.regionsGroupedByName().forEach((points, regionName) => {
            if (!this.assignedColors.has(regionName)) {
                this.assignedColors.set(regionName, getRandomColor());
            }
            const color = this.assignedColors.get(regionName)!;
            const rawCoords = points.map((p) => [p.latitude, p.longitude] as [number, number]);
            const hullCoords = getConvexHull(rawCoords);

            const polygon = L.polygon(hullCoords, {
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
                interactive: false,
            }).addTo(this.map!);

            polygon.bindTooltip(points[0].region, {
                permanent: true,
                direction: 'center',
                className: 'region-tooltip',
            });

            this.regionPolygons.set(regionName, polygon);
        });
    }

    private renderPlantCircles(plants: Plant[]): void {
        if (!this.map || !isPlatformBrowser(this.platformId)) return;

        this.plantCircles.forEach((circle) => circle.remove());
        this.plantCircles = [];

        plants.forEach((plant) => {
            const circle = L.circle([plant.latitude, plant.longitude], {
                radius: 4,
                color: '#166534',
                fillColor: '#22c55e',
                fillOpacity: 0.9,
                weight: 2,
                interactive: true,
                bubblingMouseEvents: false,
            }).addTo(this.map!);
            circle.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                this.onPlantCircleClick(plant.id);
            });
            circle.getElement()?.classList.add('plant-circle--clickable');
            this.plantCircles.push(circle);
            circle.on('mouseover', () => {
                circle.setStyle({
                    color: '#7d22d3',
                    fillColor: '#A855F7',
                    fillOpacity: 1,
                    weight: 3,
                });
            });
            circle.on('mouseout', () => {
                circle.setStyle({
                    color: '#166534',
                    fillColor: '#22C55E',
                    fillOpacity: 0.9,
                    weight: 2,
                });
            })

        });
    }
    private initMap(): void {
        this.map = L.map('map', {
            center: [-23.5505, -46.6333],
            zoom: 15,
            zoomControl: true,
            attributionControl: false,
        });
        this.initTileLayer();
        setTimeout(() => {
            this.map?.invalidateSize();
        }, 100);
        const defaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = defaultIcon;
    }
    private initTileLayer(): void {
        if (!this.map) return;
        this.tileLayer = L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(this.map);
        const isDark = this.themeService.currentTheme() === 'dark';
        const container = this.elRef.nativeElement.querySelector('#map') as HTMLElement | null;
        if (container) container.classList.toggle('map-dark', isDark);
    }

    private fitAllRegions(): void {
        if (this.regionPolygons.size > 0 && !this.selectedRegionId()) {
            const group = L.featureGroup(Array.from(this.regionPolygons.values()));
            this.map?.fitBounds(group.getBounds(), { padding: [40, 40] });
        }
    }
    private focusRegion(region: Region): void {
        const normalizedName = (region.region ?? '').trim().toLocaleLowerCase();
        const polygon = this.regionPolygons.get(normalizedName);
        if (polygon) {
            this.map?.fitBounds(polygon.getBounds(), { padding: [20, 20] });
        } else {
            const coords: L.LatLngExpression = [region.latitude, region.longitude];
            this.map?.setView(coords, this.defaultZoom);
        }
    }
}