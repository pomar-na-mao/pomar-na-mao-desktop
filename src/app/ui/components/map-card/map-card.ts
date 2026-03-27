import { Component, AfterViewInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './map-card.html',
  styleUrls: ['./map-card.scss']
})
export class MapCardComponent implements AfterViewInit, OnDestroy {
  private map?: L.Map;
  private userMarker?: L.Marker;
  private platformId = inject(PLATFORM_ID);

  private defaultCenter: L.LatLngExpression = [-23.5505, -46.6333]; // São Paulo
  private defaultZoom = 15;

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.getCurrentLocation();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
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

    // Ensure map fills container after initial layout
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    // Fix for Leaflet default marker icons not being found by build tools
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
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
