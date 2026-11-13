import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityEntryService } from '../../services/activity-entry/activity-entry.service';
import { FarmBoundaryService } from '../../services/farm-boundary/farm-boundary-service';
import { MachinesService } from '../../services/machines/machines.service';
import { MixturesService } from '../../services/mixtures/mixtures.service';
import { PlantsService } from '../../services/plants/plants-service';
import { RegionsService } from '../../services/regions/regions-service';
import { ZonesService } from '../../services/zones/zones-service';
import { ActivityEntryRepository } from './activity-entry.repository';

describe('ActivityEntryRepository', () => {
  const activityEntryService = { create: vi.fn() };
  const machinesService = { findAll: vi.fn() };
  const mixturesService = { findAll: vi.fn() };
  const farmBoundaryService = { getBoundary: vi.fn() };
  const regionsService = { findAll: vi.fn() };
  const zonesService = { findAll: vi.fn() };
  const plantsService = { getAllPlantsForMap: vi.fn() };
  let repository: ActivityEntryRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    machinesService.findAll.mockResolvedValue({ data: [], error: null });
    mixturesService.findAll.mockResolvedValue({ data: [], error: null });
    farmBoundaryService.getBoundary.mockResolvedValue([]);
    regionsService.findAll.mockResolvedValue({ data: [], error: null });
    zonesService.findAll.mockResolvedValue({ data: [], error: null });
    plantsService.getAllPlantsForMap.mockResolvedValue({
      data: [],
      error: null,
    });

    TestBed.configureTestingModule({
      providers: [
        ActivityEntryRepository,
        { provide: ActivityEntryService, useValue: activityEntryService },
        { provide: MachinesService, useValue: machinesService },
        { provide: MixturesService, useValue: mixturesService },
        { provide: FarmBoundaryService, useValue: farmBoundaryService },
        { provide: RegionsService, useValue: regionsService },
        { provide: ZonesService, useValue: zonesService },
        { provide: PlantsService, useValue: plantsService },
      ],
    });
    repository = TestBed.inject(ActivityEntryRepository);
  });

  it('builds zone polygons from ordered regions and falls back to GeoJSON', async () => {
    zonesService.findAll.mockResolvedValue({
      error: null,
      data: [
        { id: 'zone-b', name: 'Zona B', polygon: null },
        {
          id: 'zone-a',
          name: 'Zona A',
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [-49.3, -23.3],
                [-49.4, -23.3],
                [-49.4, -23.4],
                [-49.3, -23.3],
              ],
            ],
          },
        },
      ],
    });
    regionsService.findAll.mockResolvedValue({
      error: null,
      data: [
        { zone_id: 'zone-b', latitude: -23.2, longitude: -49.2, order: 2 },
        { zone_id: 'zone-b', latitude: -23.1, longitude: -49.1, order: 1 },
        { zone_id: 'zone-b', latitude: -23.3, longitude: -49.3, order: 3 },
      ],
    });
    plantsService.getAllPlantsForMap.mockResolvedValue({
      error: null,
      data: [
        {
          id: 'plant-1',
          latitude: -23.15,
          longitude: -49.15,
          zoneId: 'zone-b',
        },
        {
          id: 'invalid-plant',
          latitude: Number.NaN,
          longitude: -49.2,
          zoneId: null,
        },
      ],
    });

    const catalogs = await repository.loadCatalogs();

    expect(catalogs.zones.map((zone) => zone.name)).toEqual([
      'Zona A',
      'Zona B',
    ]);
    expect(catalogs.zones[0].coordinates).toHaveLength(3);
    expect(catalogs.zones[1].coordinates).toEqual([
      { latitude: -23.1, longitude: -49.1 },
      { latitude: -23.2, longitude: -49.2 },
      { latitude: -23.3, longitude: -49.3 },
    ]);
    expect(catalogs.plants.map((plant) => plant.id)).toEqual(['plant-1']);
  });
});
