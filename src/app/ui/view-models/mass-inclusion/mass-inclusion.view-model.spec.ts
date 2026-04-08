import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { MassInclusionViewModel } from './mass-inclusion.view-model';
import { MassInclusionRepository } from '../../../data/repositories/mass-inclusion/mass-inclusion.repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { LoadingService } from '../../../data/services/loading';
import { MessageService } from '../../../data/services/message/message.service';
import { EMPTY_MASS_INCLUSION_DATA } from '../../../domain/models/mass-inclusion';
import type { Region } from '../../../domain/models/regions.model';

function createRegion(overrides: Partial<Region> = {}): Region {
  return {
    id: 'r1',
    created_at: '2026-01-01T00:00:00Z',
    longitude: -47.79,
    latitude: -21.23,
    region: 'Norte',
    ...overrides,
  };
}

describe('MassInclusionViewModel', () => {
  let viewModel: MassInclusionViewModel;

  const polygonCoordsSignal = signal<{ lat: number; lng: number }[]>([]);
  const massInclusionDataSignal = signal(EMPTY_MASS_INCLUSION_DATA);
  const regionsSignal = signal<Region[]>([
    createRegion(),
    createRegion({ id: 'r2', region: ' norte ', latitude: -21.24, longitude: -47.80 }),
    createRegion({ id: 'r3', region: 'Sul', latitude: -21.30, longitude: -47.90 }),
  ]);

  const mockMassInclusionRepository = {
    selectedPolygonCoordinates: polygonCoordsSignal,
    currentMassInclusionData: massInclusionDataSignal,
    savePolygonCoordinates: vi.fn(),
    clearPolygonCoordinates: vi.fn(),
    saveMassInclusionData: vi.fn(),
    massUpdatePlantsInPolygon: vi.fn(),
  };

  const mockPlantsRepository = {
    queryPlants: vi.fn().mockResolvedValue([]),
  };

  const mockRegionsRepository = {
    regions: regionsSignal,
    currentRegion: signal<Region | null>(null),
    findAll: vi.fn().mockResolvedValue(undefined),
  };

  const mockLoadingService = {
    isLoading: signal(false),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    polygonCoordsSignal.set([]);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        MassInclusionViewModel,
        { provide: MassInclusionRepository, useValue: mockMassInclusionRepository },
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    });

    viewModel = TestBed.inject(MassInclusionViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  // ─── computed signals ───────────────────────────────────────────────────────

  it('uniqueRegions should deduplicate by normalized region name', () => {
    const ids = viewModel.uniqueRegions().map((r) => r.id);
    expect(ids).toEqual(['r1', 'r3']);
  });

  it('regionOptions should map uniqueRegions to AppSelectOption', () => {
    expect(viewModel.regionOptions()).toEqual([
      { value: 'r1', label: 'Norte' },
      { value: 'r3', label: 'Sul' },
    ]);
  });

  it('canEditForm should be false when fewer than 3 polygon points', () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }]);
    expect(viewModel.canEditForm()).toBe(false);
  });

  it('canEditForm should be true when 3 or more polygon points are selected', () => {
    polygonCoordsSignal.set([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);
    expect(viewModel.canEditForm()).toBe(true);
  });

  // ─── loadRegions ────────────────────────────────────────────────────────────

  it('loadRegions should set isLoadingRegions to false after completion', async () => {
    await viewModel.loadRegions();
    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoadingRegions()).toBe(false);
  });

  // ─── onRegionChange ─────────────────────────────────────────────────────────

  it('onRegionChange should update selectedRegionId', async () => {
    await viewModel.onRegionChange('r1');
    expect(viewModel.selectedRegionId()).toBe('r1');
  });

  it('onRegionChange should clear plants when region is not found', async () => {
    await viewModel.onRegionChange('unknown-id');
    expect(viewModel.plants()).toEqual([]);
  });

  // ─── onPolygonSelected ──────────────────────────────────────────────────────

  it('onPolygonSelected should call savePolygonCoordinates with valid polygon', () => {
    const coords = [
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ];
    viewModel.onPolygonSelected({ coordinates: coords, geoJson: {} });
    expect(mockMassInclusionRepository.savePolygonCoordinates).toHaveBeenCalledWith(coords);
  });

  it('onPolygonSelected should not save with fewer than 3 points', () => {
    viewModel.onPolygonSelected({ coordinates: [{ lat: 1, lng: 2 }], geoJson: {} });
    expect(mockMassInclusionRepository.savePolygonCoordinates).not.toHaveBeenCalled();
  });

  it('onPolygonSelected should not save with non-finite coordinates', () => {
    const coords = [
      { lat: NaN, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ];
    viewModel.onPolygonSelected({ coordinates: coords, geoJson: {} });
    expect(mockMassInclusionRepository.savePolygonCoordinates).not.toHaveBeenCalled();
  });

  it('onPolygonCleared should call clearPolygonCoordinates', () => {
    viewModel.onPolygonCleared();
    expect(mockMassInclusionRepository.clearPolygonCoordinates).toHaveBeenCalled();
  });

  // ─── form value handlers ────────────────────────────────────────────────────

  it('onOccurrencesChange should update occurrences control from string array', () => {
    viewModel.onOccurrencesChange(['mites', 'thrips']);
    expect(viewModel.massInclusionDataForm.controls.occurrences.value).toEqual(['mites', 'thrips']);
  });

  it('onOccurrencesChange should wrap string in array', () => {
    viewModel.onOccurrencesChange('mites');
    expect(viewModel.massInclusionDataForm.controls.occurrences.value).toEqual(['mites']);
  });

  it('onVarietyChange should update variety from string', () => {
    viewModel.onVarietyChange('Coração');
    expect(viewModel.massInclusionDataForm.controls.variety.value).toBe('Coração');
  });

  it('onVarietyChange should take first element from array', () => {
    viewModel.onVarietyChange(['Gala', 'Fuji']);
    expect(viewModel.massInclusionDataForm.controls.variety.value).toBe('Gala');
  });

  it('onClearMassInclusionFormDataHandler should reset all form fields', () => {
    viewModel.massInclusionDataForm.patchValue({
      variety: 'Gala',
      occurrences: ['mites'],
      description: 'test',
    });
    viewModel.onClearMassInclusionFormDataHandler();

    const raw = viewModel.massInclusionDataForm.getRawValue();
    expect(raw.variety).toBe('');
    expect(raw.occurrences).toEqual([]);
    expect(raw.description).toBe('');
  });

  // ─── onSaveMassInclusionDataHandler ─────────────────────────────────────────

  it('should not call rpc when polygon has fewer than 3 points', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }]);
    await viewModel.onSaveMassInclusionDataHandler();
    expect(mockMassInclusionRepository.massUpdatePlantsInPolygon).not.toHaveBeenCalled();
  });

  it('should show success message and clear state on success', async () => {
    polygonCoordsSignal.set([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);

    mockMassInclusionRepository.massUpdatePlantsInPolygon.mockResolvedValue({
      data: { message: 'ok', updated: 2, ids: [] },
      error: null,
    });

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMessageService.success).toHaveBeenCalled();
    expect(mockMassInclusionRepository.clearPolygonCoordinates).toHaveBeenCalled();
    expect(viewModel.isSaving()).toBe(false);
  });

  it('should show error message on rpc failure', async () => {
    polygonCoordsSignal.set([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);

    mockMassInclusionRepository.massUpdatePlantsInPolygon.mockResolvedValue({
      data: null,
      error: { message: 'syntax error' },
    });

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMessageService.error).toHaveBeenCalled();
    expect(viewModel.isSaving()).toBe(false);
  });

  it('should increment clearMapSignal on success', async () => {
    polygonCoordsSignal.set([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);
    const initialValue = viewModel.clearMapSignal();

    mockMassInclusionRepository.massUpdatePlantsInPolygon.mockResolvedValue({
      data: { message: 'ok', updated: 1, ids: [] },
      error: null,
    });

    await viewModel.onSaveMassInclusionDataHandler();

    expect(viewModel.clearMapSignal()).toBe(initialValue + 1);
  });
});
