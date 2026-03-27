import { Component, AfterViewInit, OnDestroy, OnInit, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';
import type { Region } from '../../../domain/models/regions.model';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { AppSelect, type AppSelectOption } from '../../../shared/components';
import { occurencesLabels } from '../../../shared/utils/occurrences';

@Component({
  selector: 'app-map-card',
  imports: [CommonModule, AppSelect],
  templateUrl: './map-card.html',
  styleUrls: ['./map-card.scss']
})
export class MapCardComponent implements OnInit, AfterViewInit, OnDestroy {
  private map?: L.Map;
  private userMarker?: L.Marker;
  private platformId = inject(PLATFORM_ID);
  private regionsRepository = inject(RegionsRepository);

  private defaultCenter: L.LatLngExpression = [-23.5505, -46.6333]; // Sao Paulo
  private defaultZoom = 15;

  public uniqueRegions = computed(() => {
    const uniqueByName = new Map<string, Region>();

    for (const region of this.regionsRepository.regions()) {
      const normalizedName = region.region.trim().toLocaleLowerCase();
      if (!uniqueByName.has(normalizedName)) {
        uniqueByName.set(normalizedName, region);
      }
    }

    return Array.from(uniqueByName.values());
  });
  public regionOptions = computed<AppSelectOption[]>(() =>
    this.uniqueRegions().map((region) => ({
      value: region.id,
      label: region.region,
    }))
  );
  public selectedRegionId = signal('');
  public isLoadingRegions = signal(true);

  public occurrenceOptions = computed<AppSelectOption[]>(() =>
    Object.entries(occurencesLabels).map(([key, value]) => ({
      value: key,
      label: value,
    }))
  );
  public selectedOccurrenceKey = signal('');

  async ngOnInit() {
    await this.loadRegions();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.focusSelectedRegionOrCurrentLocation();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  public onRegionChange(regionId: string): void {
    this.selectedRegionId.set(regionId);
    const selectedRegion = this.findRegionById(regionId);

    if (selectedRegion) {
      this.regionsRepository.currentRegion.set(selectedRegion);
      this.focusRegion(selectedRegion);
      return;
    }

    this.regionsRepository.currentRegion.set(null);
    this.getCurrentLocation();
  }

  public onOccurrenceChange(occurrenceKey: string): void {
    this.selectedOccurrenceKey.set(occurrenceKey);
  }

  private async loadRegions(): Promise<void> {
    try {
      await this.regionsRepository.findAll();

      const [firstRegion] = this.uniqueRegions();
      if (firstRegion) {
        this.selectedRegionId.set(firstRegion.id);
        this.regionsRepository.currentRegion.set(firstRegion);
      }
    } finally {
      this.isLoadingRegions.set(false);
      this.focusSelectedRegionOrCurrentLocation();
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  private focusSelectedRegionOrCurrentLocation(): void {
    const selectedRegion = this.findRegionById(this.selectedRegionId());
    if (selectedRegion) {
      this.focusRegion(selectedRegion);
      return;
    }

    this.getCurrentLocation();
  }

  private findRegionById(regionId: string): Region | undefined {
    return this.uniqueRegions().find((region) => region.id === regionId);
  }

  private focusRegion(region: Region): void {
    const coords: L.LatLngExpression = [region.latitude, region.longitude];
    this.userMarker?.remove();
    this.userMarker = undefined;
    this.map?.setView(coords, this.defaultZoom);
  }

  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const coords: L.LatLngExpression = [lat, lng];

          if (this.map) {
            this.map.setView(coords, this.defaultZoom);

            if (this.userMarker) {
              this.userMarker.setLatLng(coords);
            } else {
              const userLocationIcon = L.divIcon({
                html: `
                  <div class="user-location-marker">
                    <span class="material-symbols-outlined">location_on</span>
                  </div>
                `,
                className: 'user-location-icon-container',
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              });
              this.userMarker = L.marker(coords, { icon: userLocationIcon }).addTo(this.map);
            }
          }
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }
}
