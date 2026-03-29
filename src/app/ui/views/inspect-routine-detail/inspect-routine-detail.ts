import { Component, inject, OnInit, AfterViewInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-inspect-routine-detail',
  imports: [CommonModule],
  templateUrl: './inspect-routine-detail.html',
  styleUrls: ['./inspect-routine-detail.scss'],
})
export class InspectRoutineDetail implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private map?: L.Map;

  public id: number | null = null;

  public ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = parseInt(idParam, 10);
    }
  }

  public goBack(): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes']);
  }

  public onApprove(): void {
    console.log('Approved');
  }

  public onReject(): void {
    console.log('Rejected');
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
    // Initializing map centered at the example location from Stitch (Florida/Generic)
    // or São Paulo as a fallback like FarmOverviewMap
    this.map = L.map('map-detail', {
      center: [-23.5505, -46.6333], // Default São Paulo center
      zoom: 15,
      zoomControl: false, // Disabling native controls to use project's custom ones
      attributionControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    // Initializing with the same marker pattern as in the design
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;

    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  public zoomIn(): void {
    this.map?.zoomIn();
  }

  public zoomOut(): void {
    this.map?.zoomOut();
  }
}

