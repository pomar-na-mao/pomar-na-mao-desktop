import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MassInclusionRepository } from './mass-inclusion.repository';
import { MassInclusionService } from '../../services/mass-inclusion/mass-inclusion.service';
import { EMPTY_MASS_INCLUSION_DATA, type MassInclusionData, type MassUpdatePlantsParams } from '../../../domain/models/mass-inclusion';

const mockMassUpdatePlantsInPolygon = vi.fn();

describe('MassInclusionRepository', () => {
  let repo: MassInclusionRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MassInclusionRepository,
        {
          provide: MassInclusionService,
          useValue: {
            massUpdatePlantsInPolygon: mockMassUpdatePlantsInPolygon,
          },
        },
      ],
    });

    repo = TestBed.inject(MassInclusionRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('should start with empty polygon coordinates', () => {
    expect(repo.selectedPolygonCoordinates()).toEqual([]);
  });

  it('should start with empty mass inclusion data', () => {
    expect(repo.currentMassInclusionData()).toEqual(EMPTY_MASS_INCLUSION_DATA);
  });

  describe('savePolygonCoordinates', () => {
    it('should save coordinates to signal', () => {
      const coords = [
        { lat: -21.23, lng: -47.79 },
        { lat: -21.24, lng: -47.78 },
      ];
      repo.savePolygonCoordinates(coords);
      expect(repo.selectedPolygonCoordinates()).toEqual(coords);
    });

    it('should map only lat and lng from coordinates', () => {
      const coords = [{ lat: 10, lng: 20 }];
      repo.savePolygonCoordinates(coords);
      expect(repo.selectedPolygonCoordinates()[0]).toEqual({ lat: 10, lng: 20 });
    });
  });

  describe('clearPolygonCoordinates', () => {
    it('should reset coordinates to empty array', () => {
      repo.savePolygonCoordinates([{ lat: 1, lng: 2 }]);
      repo.clearPolygonCoordinates();
      expect(repo.selectedPolygonCoordinates()).toEqual([]);
    });
  });

  describe('saveMassInclusionData', () => {
    it('should persist data to signal', () => {
      const data: MassInclusionData = {
        occurrences: ['mites'],
        variety: 'Coração',
        lifeOfTree: '3 anos',
        plantingDate: '2022-01-01',
        description: 'Desc',
      };
      repo.saveMassInclusionData(data);
      expect(repo.currentMassInclusionData()).toEqual(data);
    });
  });

  describe('massUpdatePlantsInPolygon', () => {
    it('should delegate to service and return result', async () => {
      const expected = { data: { message: 'ok', updated: 1, ids: ['x'] }, error: null };
      mockMassUpdatePlantsInPolygon.mockResolvedValue(expected);

      const params: MassUpdatePlantsParams = {
        coordinates: [{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }],
        occurrences: [],
      };

      const result = await repo.massUpdatePlantsInPolygon(params);

      expect(mockMassUpdatePlantsInPolygon).toHaveBeenCalledWith(params);
      expect(result).toEqual(expected);
    });
  });
});
