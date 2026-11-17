import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { MessageService } from '../../../data/services/message/message.service';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { PropertyDemarcationViewModel } from './property-demarcation.view-model';

describe('PropertyDemarcationViewModel', () => {
  let viewModel: PropertyDemarcationViewModel;
  const farmBoundaryService = {
    getBoundary: vi.fn(),
    replaceBoundary: vi.fn(),
  };
  const messageService = {
    success: vi.fn(),
    error: vi.fn(),
  };
  const allPlants = signal([
    { id: '1', latitude: -23.1, longitude: -49.1, zoneId: null },
    {
      id: '2',
      latitude: -23.2,
      longitude: -49.2,
      zoneId: null,
      non_existent: true,
    },
  ]);
  const plantsRepository = {
    allPlants,
    loadAllPlants: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    farmBoundaryService.getBoundary.mockResolvedValue([]);
    farmBoundaryService.replaceBoundary.mockResolvedValue(3);
    plantsRepository.loadAllPlants.mockResolvedValue({ data: allPlants(), error: null });
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        PropertyDemarcationViewModel,
        { provide: FarmBoundaryService, useValue: farmBoundaryService },
        { provide: MessageService, useValue: messageService },
        { provide: PlantsRepository, useValue: plantsRepository },
      ],
    });

    viewModel = TestBed.inject(PropertyDemarcationViewModel);
  });

  it('should keep the default map when no boundary exists', async () => {
    await viewModel.loadBoundary();

    expect(viewModel.persistedBoundary()).toBeNull();
    expect(viewModel.mapCenter()).toEqual([-23.398772, -49.148646]);
    expect(viewModel.isLoading()).toBe(false);
  });

  it('should load an existing boundary in persisted order', async () => {
    farmBoundaryService.getBoundary.mockResolvedValue([
      { latitude: -23.2, longitude: -49.2, order: 2 },
      { latitude: -23.1, longitude: -49.1, order: 1 },
      { latitude: -23.3, longitude: -49.3, order: 3 },
    ]);

    await viewModel.loadBoundary();

    expect(viewModel.persistedBoundary()).toEqual([
      [-23.1, -49.1],
      [-23.2, -49.2],
      [-23.3, -49.3],
    ]);
  });

  it('should load and expose active plants for the property map', async () => {
    await viewModel.loadBoundary();

    expect(plantsRepository.loadAllPlants).toHaveBeenCalledOnce();
    expect(viewModel.plants().map((plant) => plant.id)).toEqual(['1']);
  });

  it('should keep the boundary available when loading plants fails', async () => {
    farmBoundaryService.getBoundary.mockResolvedValue([
      { latitude: -23.1, longitude: -49.1, order: 1 },
      { latitude: -23.2, longitude: -49.2, order: 2 },
      { latitude: -23.3, longitude: -49.3, order: 3 },
    ]);
    plantsRepository.loadAllPlants.mockResolvedValue({
      data: null,
      error: new Error('failed'),
    });

    await viewModel.loadBoundary();

    expect(viewModel.persistedBoundary()).toHaveLength(3);
    expect(messageService.error).toHaveBeenCalledWith(
      'Não foi possível carregar as plantas no mapa.',
    );
  });

  it('should focus valid coordinates without changing the candidate polygon', () => {
    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
      { lat: -23.3, lng: -49.3 },
    ]);
    const candidate = viewModel.candidateBoundary();
    viewModel.coordinateForm.setValue({
      latitude: '-22.5',
      longitude: '-48.5',
    });

    expect(viewModel.focusCoordinates()).toBe(true);
    expect(viewModel.mapCenter()).toEqual([-22.5, -48.5]);
    expect(viewModel.mapZoom()).toBe(19);
    expect(viewModel.candidateBoundary()).toBe(candidate);
  });

  it('should accept numeric values emitted by number inputs', () => {
    viewModel.coordinateForm.setValue({
      latitude: -22.5,
      longitude: -48.5,
    });

    expect(viewModel.focusCoordinates()).toBe(true);
    expect(viewModel.mapCenter()).toEqual([-22.5, -48.5]);
    expect(viewModel.coordinateError()).toBe('');
  });

  it('should reject invalid coordinates without moving the map', () => {
    const originalCenter = viewModel.mapCenter();
    viewModel.coordinateForm.setValue({
      latitude: '91',
      longitude: '-49',
    });

    expect(viewModel.focusCoordinates()).toBe(false);
    expect(viewModel.mapCenter()).toBe(originalCenter);
    expect(viewModel.coordinateError()).toContain('latitude');
  });

  it('should save in marking order, reload, and clear the candidate', async () => {
    const points = [
      { lat: -23.3, lng: -49.3 },
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ];
    viewModel.onPolygonSelected(points);
    farmBoundaryService.getBoundary.mockResolvedValue(
      points.map((point, index) => ({
        latitude: point.lat,
        longitude: point.lng,
        order: index + 1,
      })),
    );

    await expect(viewModel.saveBoundary()).resolves.toBe(true);

    expect(farmBoundaryService.replaceBoundary).toHaveBeenCalledWith([
      { latitude: -23.3, longitude: -49.3 },
      { latitude: -23.1, longitude: -49.1 },
      { latitude: -23.2, longitude: -49.2 },
    ]);
    expect(viewModel.persistedBoundary()).toEqual([
      [-23.3, -49.3],
      [-23.1, -49.1],
      [-23.2, -49.2],
    ]);
    expect(viewModel.candidateBoundary()).toEqual([]);
    expect(viewModel.clearMapSignal()).toBe(1);
    expect(messageService.success).toHaveBeenCalledWith(
      'Demarcação salva com 3 pontos.',
    );
  });

  it('should retain the candidate when saving fails', async () => {
    viewModel.onPolygonSelected([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
      { lat: -23.3, lng: -49.3 },
    ]);
    farmBoundaryService.replaceBoundary.mockRejectedValue(new Error('failed'));

    await expect(viewModel.saveBoundary()).resolves.toBe(false);

    expect(viewModel.candidateBoundary()).toHaveLength(3);
    expect(viewModel.clearMapSignal()).toBe(0);
    expect(messageService.error).toHaveBeenCalled();
  });
});
