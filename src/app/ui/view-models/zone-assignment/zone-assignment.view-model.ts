import { computed, inject, Injectable, signal } from '@angular/core';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { ZoneAssignmentRepository } from '../../../data/repositories/zone-assignment/zone-assignment.repository';
import { MessageService } from '../../../data/services/message/message.service';
import { LoadingService } from '../../../shared/services/loading.service';
import type { Region } from '../../../domain/models/regions.model';
import type { PolygonCoordinate } from '../../../domain/models/mass-inclusion';
import type { SelectOption } from '../../../shared/components/select/select';
import { toClosedGeoJsonPolygon } from '../../../shared/utils/polygon-geojson';

@Injectable({
  providedIn: 'root',
})
export class ZoneAssignmentViewModel {
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private zoneAssignmentRepository = inject(ZoneAssignmentRepository);
  private loadingService = inject(LoadingService);
  public messageService = inject(MessageService);

  public selectedZoneId = signal<string>('');
  public selectedZonePoints = signal<Region[]>([]);
  public isLoadingInitialData = signal(false);
  public isLoadingZonePoints = signal(false);
  public isPreviewing = signal(false);
  public isSaving = signal(false);
  public previewLoaded = signal(false);
  public previewError = signal<string | null>(null);
  public clearMapSignal = signal(0);
  public isMapFullscreen = signal(false);
  public applyZonePolygonSignal = signal<[number, number][] | null>(null);

  public allPlants = this.zoneAssignmentRepository.allPlants;
  public previewPlants = this.zoneAssignmentRepository.previewPlants;
  public selectedPlants = this.zoneAssignmentRepository.selectedPlants;
  public plantsFoundCount = this.zoneAssignmentRepository.plantsFoundCount;
  public selectedPlantsCount = this.zoneAssignmentRepository.selectedPlantsCount;
  public selectedPolygonCoordinates = this.zoneAssignmentRepository.selectedPolygonCoordinates;

  public zones = this.zonesRepository.zones;

  public selectedZone = computed(() => {
    const id = this.selectedZoneId();
    if (!id) return null;
    return this.zones().find((z) => z.id === id) ?? null;
  });

  public zoneOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Selecione uma zona...' },
    ...this.zones().map((z) => ({
      value: z.id,
      label: `${z.name}${z.code ? ' (' + z.code + ')' : ''}`,
    })),
  ]);

  public selectedZonePolygon = computed<[number, number][] | null>(() => {
    const points = this.selectedZonePoints();
    if (points.length < 3) return null;

    return points.map((p) => [p.latitude, p.longitude]);
  });

  public hasPolygon = computed(() => this.selectedPolygonCoordinates().length >= 3);

  public canConfirm = computed(
    () =>
      this.selectedZoneId() !== '' &&
      (this.previewLoaded() ? this.selectedPlantsCount() > 0 : this.hasPolygon()) &&
      !this.isSaving() &&
      !this.isPreviewing(),
  );

  public async loadInitialData(): Promise<void> {
    this.isLoadingInitialData.set(true);
    try {
      await Promise.all([
        this.zonesRepository.findAll(),
        this.zoneAssignmentRepository.loadAllPlants(),
      ]);
    } catch {
      this.messageService.error('Erro ao carregar dados iniciais.');
    } finally {
      this.isLoadingInitialData.set(false);
    }
  }

  public async onZoneChange(zoneId: string | string[]): Promise<void> {
    const normalized = Array.isArray(zoneId) ? (zoneId[0] ?? '') : zoneId;
    this.selectedZoneId.set(normalized);
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.zoneAssignmentRepository.clearPreviewPlants();

    if (!normalized) {
      this.selectedZonePoints.set([]);
      return;
    }

    this.isLoadingZonePoints.set(true);
    try {
      const { data, error } = await this.regionsRepository.findByZoneId(normalized);
      if (error) {
        this.messageService.error('Erro ao buscar coordenadas da zona selecionada.');
        this.selectedZonePoints.set([]);
      } else {
        this.selectedZonePoints.set(data ?? []);
      }
    } finally {
      this.isLoadingZonePoints.set(false);
    }
  }

  public onPolygonSelected(coordinates: PolygonCoordinate[]): void {
    if (coordinates.length < 3) {
      return;
    }

    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.zoneAssignmentRepository.savePolygonCoordinates(coordinates);
  }

  public onPolygonCleared(): void {
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.zoneAssignmentRepository.clearPolygonCoordinates();
  }

  public useZonePolygonAsSelection(): void {
    const polygon = this.selectedZonePolygon();
    if (!polygon || polygon.length < 3) {
      this.messageService.warn('A zona selecionada não possui pontos de contorno suficientes.');
      return;
    }

    this.applyZonePolygonSignal.set([...polygon]);
  }

  public async onPreviewPlants(): Promise<void> {
    const coords = this.selectedPolygonCoordinates();
    if (coords.length < 3) {
      this.messageService.warn('Desenhe ou aplique um polígono no mapa primeiro.');
      return;
    }

    this.isPreviewing.set(true);
    this.previewError.set(null);
    try {
      const polygonGeojson = toClosedGeoJsonPolygon(coords);
      const { data, error } =
        await this.zoneAssignmentRepository.previewPlantsInsidePolygon(polygonGeojson);

      if (error || !data) {
        this.previewLoaded.set(false);
        this.previewError.set('Erro ao buscar plantas dentro do polígono.');
        this.messageService.error('Erro ao buscar plantas dentro do polígono.');
      } else {
        this.previewLoaded.set(true);
      }
    } catch {
      this.previewLoaded.set(false);
      this.previewError.set('Polígono inválido para busca.');
      this.messageService.error('Polígono inválido para busca.');
    } finally {
      this.isPreviewing.set(false);
    }
  }

  public setPlantSelected(plantId: string, selected: boolean): void {
    this.zoneAssignmentRepository.setPlantSelected(plantId, selected);
  }

  public toggleSelectAllPlants(selected: boolean): void {
    this.zoneAssignmentRepository.toggleAllPlants(selected);
  }

  public clear(): void {
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.zoneAssignmentRepository.clearPolygonCoordinates();
    this.clearMapSignal.update((v) => v + 1);
  }

  public async save(): Promise<void> {
    const zoneId = this.selectedZoneId();
    if (!zoneId) {
      this.messageService.error('Selecione uma zona para atribuir.');
      return;
    }

    if (!this.previewLoaded()) {
      await this.onPreviewPlants();
    }

    const selectedPlants = this.selectedPlants();
    if (selectedPlants.length === 0) {
      this.messageService.warn('Nenhuma planta encontrada ou selecionada para atribuição.');
      return;
    }

    const plantIds = selectedPlants.map((p) => p.plantId);

    this.isSaving.set(true);
    this.loadingService.show(`Atribuindo ${plantIds.length} plantas à zona...`);

    try {
      const { data, error } = await this.zoneAssignmentRepository.assignPlantsToZone({
        zoneId,
        plantIds,
      });

      if (error || !data) {
        this.messageService.error('Erro ao atribuir plantas à zona no Supabase.');
        return;
      }

      const zoneName = data.zoneName || this.selectedZone()?.name || 'Zona';
      this.messageService.success(
        `Sucesso: ${data.plantsUpdatedCount} plantas foram atribuídas à ${zoneName}!`,
      );

      this.clear();
      await this.zoneAssignmentRepository.loadAllPlants();
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }
}
