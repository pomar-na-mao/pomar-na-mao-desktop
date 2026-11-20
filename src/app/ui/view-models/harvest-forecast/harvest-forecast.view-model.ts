import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import {
  cloneHarvestWeights,
  type HarvestClassification,
  type HarvestClassificationFilter,
  type HarvestForecastMarker,
  type HarvestForecastSnapshot,
  type HarvestScenario,
  type HarvestWeightClassification,
  type HarvestWeights,
} from '../../../domain/models/harvest-forecast.model';
import {
  HarvestForecastService,
  isHarvestForecastConflict,
} from '../../../data/services/harvest-forecast/harvest-forecast.service';
import { MessageService } from '../../../data/services/message/message.service';

const DEFAULT_CENTER: L.LatLngExpression = [-23.5505, -46.6333];

export const HARVEST_CLASS_COLORS: Record<HarvestClassification, string> = {
  N: '#64748b',
  P: '#eab308',
  M: '#f97316',
  G: '#16a34a',
  GG: '#2563eb',
};

export interface HarvestWeightEdit {
  scenario: HarvestScenario;
  classification: HarvestWeightClassification;
}

@Injectable()
export class HarvestForecastViewModel {
  private readonly service = inject(HarvestForecastService);
  private readonly messages = inject(MessageService);
  private requestVersion = 0;
  private map: L.Map | null = null;
  private markerLayer: L.LayerGroup | null = null;

  public readonly selectedYear = signal<number | null>(null);
  public readonly selectedClassification =
    signal<HarvestClassificationFilter>('TODAS');
  public readonly selectedZoneId = signal('');
  public readonly selectedScenario = signal<HarvestScenario>('REALISTA');
  public readonly weights = signal<HarvestWeights>(cloneHarvestWeights());
  public readonly snapshot = signal<HarvestForecastSnapshot | null>(null);
  public readonly forecastResult = signal<HarvestForecastSnapshot | null>(null);
  public readonly selectedMarker = signal<HarvestForecastMarker | null>(null);
  public readonly editClassification = signal<HarvestClassification>('N');
  public readonly editingWeight = signal<HarvestWeightEdit | null>(null);
  public readonly weightDraft = signal('');
  public readonly weightError = signal('');
  public readonly loading = signal(false);
  public readonly calculating = signal(false);
  public readonly saving = signal(false);
  public readonly isMapFullscreen = signal(false);

  public readonly yearOptions = computed(() =>
    (this.snapshot()?.years ?? []).map((year) => ({
      label: String(year),
      value: year,
    })),
  );
  public readonly zoneOptions = computed(() => [
    { label: 'Todas', value: '' },
    ...(this.snapshot()?.zones ?? []).map((zone) => ({
      label: zone.name,
      value: zone.id,
    })),
  ]);

  constructor() {
    effect(() => {
      this.snapshot();
      this.renderMarkers();
    });
  }

  public async initialize(): Promise<void> {
    await this.loadSnapshot(false);
  }

  public async setYear(value: number | string | null): Promise<void> {
    this.selectedYear.set(value === null || value === '' ? null : Number(value));
    this.invalidateForecast();
    await this.loadSnapshot(false);
  }

  public async setClassification(value: string): Promise<void> {
    this.selectedClassification.set(value as HarvestClassificationFilter);
    this.invalidateForecast();
    await this.loadSnapshot(false);
  }

  public async setZone(value: string): Promise<void> {
    this.selectedZoneId.set(value);
    this.invalidateForecast();
    await this.loadSnapshot(false);
  }

  public setScenario(value: string): void {
    this.selectedScenario.set(value as HarvestScenario);
    this.invalidateForecast();
  }

  public async calculateForecast(): Promise<void> {
    this.calculating.set(true);
    await this.loadSnapshot(true);
  }

  public beginWeightEdit(
    scenario: HarvestScenario,
    classification: HarvestWeightClassification,
  ): void {
    this.editingWeight.set({ scenario, classification });
    this.weightDraft.set(String(this.weights()[scenario][classification]));
    this.weightError.set('');
  }

  public confirmWeightEdit(): boolean {
    const cell = this.editingWeight();
    if (!cell) return false;

    const value = Number(this.weightDraft().replace(',', '.'));
    if (!Number.isFinite(value) || value < 0 || this.weightDraft().trim() === '') {
      this.weightError.set('Informe um peso igual ou maior que zero.');
      return false;
    }

    const weights = cloneHarvestWeights(this.weights());
    weights[cell.scenario][cell.classification] = value;
    this.weights.set(weights);
    this.cancelWeightEdit();
    this.invalidateForecast();
    return true;
  }

  public cancelWeightEdit(): void {
    this.editingWeight.set(null);
    this.weightDraft.set('');
    this.weightError.set('');
  }

  public isEditingWeight(
    scenario: HarvestScenario,
    classification: HarvestWeightClassification,
  ): boolean {
    const editing = this.editingWeight();
    return (
      editing?.scenario === scenario && editing.classification === classification
    );
  }

  public selectMarker(marker: HarvestForecastMarker): void {
    this.selectedMarker.set(marker);
    this.editClassification.set(marker.classification);
  }

  public closeMarkerEditor(): void {
    this.selectedMarker.set(null);
  }

  public async saveMarkerClassification(): Promise<void> {
    const marker = this.selectedMarker();
    if (!marker || this.saving()) return;

    const preserveForecast = this.forecastResult() !== null;
    this.saving.set(true);
    try {
      await this.service.updateClassification({
        id: marker.id,
        classification: this.editClassification(),
        expectedUpdatedAt: marker.updated_at,
      });
      this.messages.success('Classificação atualizada com sucesso.');
      this.selectedMarker.set(null);
      await this.loadSnapshot(preserveForecast);
    } catch (error) {
      this.messages.error(
        isHarvestForecastConflict(error)
          ? 'A marcação mudou desde a consulta. Os dados foram atualizados.'
          : 'Não foi possível atualizar a classificação.',
      );
      await this.loadSnapshot(preserveForecast);
    } finally {
      this.saving.set(false);
    }
  }

  public initMap(elementId: string): void {
    this.destroyMap();
    this.map = L.map(elementId, { maxZoom: 22, preferCanvas: true }).setView(
      DEFAULT_CENTER,
      16,
    );
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri World Imagery',
        maxZoom: 22,
        maxNativeZoom: 18,
      },
    ).addTo(this.map);
    this.markerLayer = L.layerGroup().addTo(this.map);
    this.renderMarkers();
  }

  public destroyMap(): void {
    this.map?.remove();
    this.map = null;
    this.markerLayer = null;
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  public invalidateMapSize(): void {
    setTimeout(() => this.map?.invalidateSize(), 180);
  }

  private async loadSnapshot(showForecast: boolean): Promise<void> {
    const version = ++this.requestVersion;
    if (showForecast) {
      this.calculating.set(true);
    } else {
      this.loading.set(true);
    }

    try {
      const snapshot = await this.service.getSnapshot({
        year: this.selectedYear(),
        classification: this.selectedClassification(),
        zoneId: this.selectedZoneId(),
        scenario: this.selectedScenario(),
        weights: this.weights(),
      });
      if (version !== this.requestVersion) return;

      this.snapshot.set(snapshot);
      const selectedMarker = this.selectedMarker();
      if (selectedMarker) {
        const latestMarker =
          snapshot.markers.find((marker) => marker.id === selectedMarker.id) ?? null;
        this.selectedMarker.set(latestMarker);
        if (latestMarker) {
          this.editClassification.set(latestMarker.classification);
        }
      }
      if (this.selectedYear() === null && snapshot.year !== null) {
        this.selectedYear.set(snapshot.year);
      }
      this.forecastResult.set(showForecast ? snapshot : null);
    } catch {
      if (version !== this.requestVersion) return;
      this.messages.error('Não foi possível carregar a previsão de safra.');
      if (showForecast) this.forecastResult.set(null);
    } finally {
      if (version === this.requestVersion) {
        this.loading.set(false);
        this.calculating.set(false);
      }
    }
  }

  private invalidateForecast(): void {
    this.requestVersion += 1;
    this.forecastResult.set(null);
    this.loading.set(false);
    this.calculating.set(false);
  }

  private renderMarkers(): void {
    if (!this.map || !this.markerLayer) return;

    this.markerLayer.clearLayers();
    const markers = this.snapshot()?.markers ?? [];
    if (markers.length === 0) {
      this.map.setView(DEFAULT_CENTER, 16);
      return;
    }

    const bounds = L.latLngBounds([]);
    for (const marker of markers) {
      const color = HARVEST_CLASS_COLORS[marker.classification];
      L.circleMarker([marker.latitude, marker.longitude], {
        radius: 7,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.95,
        weight: 1.5,
      })
        .bindTooltip(marker.classification, {
          direction: 'top',
          offset: [0, -5],
        })
        .on('click', () => this.selectMarker(marker))
        .addTo(this.markerLayer);
      bounds.extend([marker.latitude, marker.longitude]);
    }
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
    }
  }
}
