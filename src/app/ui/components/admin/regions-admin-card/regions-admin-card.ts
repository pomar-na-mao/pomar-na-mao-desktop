import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';
import { Region } from '../../../../domain/models/regions.model';
import { getConvexHull } from '../../../../shared/utils/geolocation-math';
import { RegionsStats } from '../../../view-models/regions/regions.view-model';

@Component({
  selector: 'app-regions-admin-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5 transition-colors">
        <div>
          <p class="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 transition-colors">Administração</p>
          <h2 class="mt-1 text-lg font-bold text-slate-800 dark:text-white transition-colors">Mapa de Zonas</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">Visualização consolidada dos polígonos formados pelos pontos da tabela regions.</p>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 shadow-sm"
          title="Atualizar lista"
          (click)="renderRegions()"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      @if (isLoading) {
        <div class="flex flex-1 items-center justify-center py-16">
          <div class="flex flex-col items-center gap-3">
            <div class="w-10 h-10 border-4 border-emerald-100 dark:border-emerald-500/10 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
            <p class="text-sm font-bold text-slate-400 dark:text-slate-500">Carregando zonas...</p>
          </div>
        </div>
      } @else if (regions.length === 0) {
        <div class="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <div class="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
            <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Nenhuma zona encontrada</h3>
          <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Não há pontos suficientes para desenhar zonas no mapa.</p>
        </div>
      } @else {
        <div class="flex flex-1 flex-col gap-6 p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Total de Pontos</p>
              <strong class="mt-1 block text-3xl font-black text-slate-800 dark:text-white">{{ stats.total }}</strong>
            </div>
            <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Zonas Distintas</p>
              <strong class="mt-1 block text-3xl font-black text-slate-800 dark:text-white">{{ stats.unique }}</strong>
            </div>
          </div>

          <div class="grid flex-1 min-h-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="min-h-0 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30">
              <div #mapContainer class="h-full min-h-[28rem] w-full"></div>
            </div>

            <div class="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-5">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Resumo por Zona</p>
              <div class="mt-4 space-y-3">
                @for (summary of regionSummaries; track summary.name) {
                  <div class="rounded-xl border border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 px-4 py-3 transition-colors">
                    <div class="flex items-center justify-between gap-4">
                      <div>
                        <p class="text-sm font-bold text-slate-800 dark:text-white">{{ summary.name }}</p>
                        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {{ summary.points }} ponto(s)
                          @if (summary.hasPolygon) {
                            <span>• polígono renderizado</span>
                          } @else {
                            <span>• pontos insuficientes para polígono</span>
                          }
                        </p>
                      </div>
                      <span class="inline-flex h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900" [style.background]="summary.color"></span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </section>
  `,
})
export class RegionsAdminCard implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  @Input() regions: Region[] = [];
  @Input() stats: RegionsStats = { total: 0, unique: 0 };
  @Input() isLoading = false;

  private map: L.Map | null = null;
  private layerGroup: L.LayerGroup | null = null;

  private readonly regionPalette = [
    '#10b981',
    '#0ea5e9',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#14b8a6',
    '#f97316',
    '#84cc16',
  ];

  public get regionSummaries(): Array<{ name: string; points: number; hasPolygon: boolean; color: string }> {
    return this.buildRegionGroups().map((group, index) => ({
      name: group.name,
      points: group.points.length,
      hasPolygon: group.hull.length >= 3,
      color: this.regionPalette[index % this.regionPalette.length],
    }));
  }

  public ngAfterViewInit(): void {
    this.initializeMap();
    this.renderRegions();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ('regions' in changes && !changes['regions'].firstChange) {
      this.renderRegions();
    }
  }

  public ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initializeMap(): void {
    if (this.map || !this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-23.398772, -49.148646],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 24,
    }).addTo(this.map);

    this.layerGroup = L.layerGroup().addTo(this.map);
  }

  public renderRegions(): void {
    if (!this.map || !this.layerGroup) return;

    this.layerGroup.clearLayers();
    const groups = this.buildRegionGroups();

    if (groups.length === 0) {
      this.map.setView([-23.398772, -49.148646], 15);
      return;
    }

    const bounds: L.LatLngTuple[] = [];
    const preferredGroupBounds: L.LatLngTuple[] = [];
    // `groups` is already sorted alphabetically by name (pt-BR) in `buildRegionGroups()`.
    // Prefer starting the view focused on the first group to avoid zooming out too much.
    const preferredGroup = groups[0];

    groups.forEach((group, index) => {
      const color = this.regionPalette[index % this.regionPalette.length];
      const tooltip = `${group.name} • ${group.points.length} ponto(s)`;

      if (group.hull.length >= 3) {
        L.polygon(group.hull, {
          color,
          fillColor: color,
          fillOpacity: 0.16,
          weight: 2.5,
        })
          .bindTooltip(tooltip)
          .addTo(this.layerGroup!);

        bounds.push(...group.hull);
        if (group === preferredGroup) preferredGroupBounds.push(...group.hull);
      }

      group.points.forEach((point) => {
        L.circleMarker(point, {
          radius: 4,
          color: '#ffffff',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.95,
        })
          .bindTooltip(tooltip)
          .addTo(this.layerGroup!);

        bounds.push(point);
        if (group === preferredGroup) preferredGroupBounds.push(point);
      });
    });

    const finalBounds = preferredGroupBounds.length > 0 ? preferredGroupBounds : bounds;
    if (finalBounds.length > 0) {
      this.map.fitBounds(finalBounds, { padding: [32, 32], maxZoom: 19 });
    }
  }

  private buildRegionGroups(): Array<{ name: string; points: [number, number][]; hull: [number, number][] }> {
    const groups = new Map<string, { name: string; points: [number, number][] }>();

    for (const region of this.regions) {
      const normalizedName = region.region.trim().toLocaleLowerCase();
      const current = groups.get(normalizedName) ?? { name: region.region, points: [] };
      current.points.push([region.latitude, region.longitude]);
      groups.set(normalizedName, current);
    }

    return Array.from(groups.values())
      .map((group) => ({
        name: group.name,
        points: group.points,
        hull: getConvexHull(group.points),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
  }
}
