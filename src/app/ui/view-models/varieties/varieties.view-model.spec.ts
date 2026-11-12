import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { Variety } from '../../../domain/models/variety.model';
import type { PlantMapItem } from '../../../domain/models/plant-data.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { VarietiesViewModel } from './varieties.view-model';

function mockVariety(id = 1, name = 'Hass'): Variety {
  return {
    id,
    name,
    description: 'Descrição',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  };
}

describe('VarietiesViewModel', () => {
  let viewModel: VarietiesViewModel;
  const varieties = signal<Variety[]>([]);
  const allPlants = signal<PlantMapItem[]>([]);
  const zones = signal<any[]>([]);
  const regions = signal<any[]>([]);

  const varietiesRepo = {
    varieties,
    findAll: vi.fn(),
    create: vi.fn(),
    createWithPlants: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  const zonesRepo = {
    zones,
    findAll: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const regionsRepo = {
    regions,
    findAll: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const farmBoundaryService = {
    getBoundary: vi.fn().mockResolvedValue([]),
  };

  const plantsRepo = {
    allPlants,
    loadAllPlants: vi.fn().mockResolvedValue({ data: [], error: null }),
  };

  const messages = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const loading = {
    show: vi.fn(),
    hide: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    varieties.set([]);
    allPlants.set([]);
    zones.set([]);
    regions.set([]);

    varietiesRepo.findAll.mockResolvedValue({ error: null });
    zonesRepo.findAll.mockResolvedValue({ data: [], error: null });
    regionsRepo.findAll.mockResolvedValue({ data: [], error: null });
    plantsRepo.loadAllPlants.mockResolvedValue({ data: [], error: null });
    farmBoundaryService.getBoundary.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        VarietiesViewModel,
        { provide: VarietiesRepository, useValue: varietiesRepo },
        { provide: ZonesRepository, useValue: zonesRepo },
        { provide: RegionsRepository, useValue: regionsRepo },
        { provide: FarmBoundaryService, useValue: farmBoundaryService },
        { provide: PlantsRepository, useValue: plantsRepo },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    });
    viewModel = TestBed.inject(VarietiesViewModel);
  });

  it('loads data and reports initial load errors', async () => {
    await viewModel.loadInitialData();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);

    varietiesRepo.findAll.mockResolvedValueOnce({ error: { message: 'failed' } });
    await viewModel.loadInitialData();

    expect(viewModel.loadFailed()).toBe(true);
    expect(messages.error).toHaveBeenCalledWith('Erro ao carregar variedades existentes.');
  });

  it('disables create form when no polygon is selected', () => {
    expect(viewModel.hasPolygon()).toBe(false);
    expect(viewModel.canSubmitCreate()).toBe(false);
    expect(viewModel.newVarietyForm.disabled).toBe(true);

    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ]);

    expect(viewModel.hasPolygon()).toBe(true);
    expect(viewModel.newVarietyForm.enabled).toBe(true);
  });

  it('assigns distinctive colors for each variety in mapPlants', () => {
    const v1 = mockVariety(1, 'Hass');
    const v2 = mockVariety(2, 'Breda');
    varieties.set([v1, v2]);

    allPlants.set([
      {
        id: 'p1',
        latitude: -23.1,
        longitude: -49.1,
        zoneId: null,
        varietyId: 1,
        varietyName: 'Hass',
      },
      {
        id: 'p2',
        latitude: -23.2,
        longitude: -49.2,
        zoneId: null,
        varietyId: 2,
        varietyName: 'Breda',
      },
      {
        id: 'p3',
        latitude: -23.3,
        longitude: -49.3,
        zoneId: null,
        varietyId: null,
        varietyName: null,
      },
    ]);

    const mapped = viewModel.mapPlants();
    expect(mapped).toHaveLength(3);
    // Plant 1 has Hass color
    expect(mapped[0].fillColor).not.toBe('#9ca3af');
    // Plant 2 has Breda color
    expect(mapped[1].fillColor).not.toBe('#9ca3af');
    expect(mapped[0].fillColor).not.toBe(mapped[1].fillColor);
    // Plant 3 has unassigned gray color
    expect(mapped[2].fillColor).toBe('#9ca3af');
  });

  it('validates variety name when creating new variety', async () => {
    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ]);

    viewModel.newVarietyForm.controls.name.setValue('   ');
    await viewModel.saveNewVariety();

    expect(viewModel.nameError()).toBe('Informe o nome da variedade.');
    expect(varietiesRepo.createWithPlants).not.toHaveBeenCalled();
  });

  it('saves new variety with polygon and plants and reloads plants', async () => {
    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ]);

    viewModel.newVarietyForm.setValue({
      name: '  Margarida ',
      description: ' Variedade tardia ',
    });

    const created = mockVariety(3, 'Margarida');
    varietiesRepo.createWithPlants.mockResolvedValue({
      data: { variety: created, plants_updated_count: 28 },
      error: null,
    });

    await viewModel.saveNewVariety();

    expect(varietiesRepo.createWithPlants).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Margarida',
        description: 'Variedade tardia',
        polygonGeojson: expect.any(Object),
      }),
    );
    expect(plantsRepo.loadAllPlants).toHaveBeenCalled();
    expect(messages.success).toHaveBeenCalledWith(
      'Variedade “Margarida” criada com sucesso e atribuída a 28 planta(s)!',
    );
    expect(viewModel.hasPolygon()).toBe(false);
  });

  it('opens edit modal and saves updated name and description', async () => {
    const item = mockVariety(1, 'Hass');
    viewModel.openEdit(item);

    expect(viewModel.editDialogVisible()).toBe(true);
    expect(viewModel.editForm.controls.name.value).toBe('Hass');

    viewModel.editForm.controls.name.setValue('Hass Atualizado');
    varietiesRepo.update.mockResolvedValue({
      data: { ...item, name: 'Hass Atualizado' },
      error: null,
    });

    await viewModel.saveEdit();

    expect(varietiesRepo.update).toHaveBeenCalledWith(1, {
      name: 'Hass Atualizado',
      description: 'Descrição',
    });
    expect(messages.success).toHaveBeenCalledWith('Variedade editada com sucesso.');
    expect(viewModel.editDialogVisible()).toBe(false);
  });

  it('deletes a variety and refreshes plants', async () => {
    const item = mockVariety(1, 'Hass');
    varietiesRepo.deleteMany.mockResolvedValue({ error: null });

    await viewModel.deleteVariety(item);

    expect(varietiesRepo.deleteMany).toHaveBeenCalledWith([1]);
    expect(plantsRepo.loadAllPlants).toHaveBeenCalled();
    expect(messages.success).toHaveBeenCalledWith(
      'Variedade “Hass” excluída com sucesso.',
    );
  });

  it('clears form and resets map signal', () => {
    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ]);
    viewModel.newVarietyForm.controls.name.setValue('Teste');

    viewModel.clearNewVarietyForm();

    expect(viewModel.hasPolygon()).toBe(false);
    expect(viewModel.newVarietyForm.controls.name.value).toBe('');
    expect(viewModel.clearMapSignal()).toBeGreaterThan(0);
  });
});
