import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityEntryRepository } from '../../../data/repositories/activity-entry/activity-entry.repository';
import { MessageService } from '../../../data/services/message/message.service';
import { ActivityEntryViewModel } from './activity-entry.view-model';

describe('ActivityEntryViewModel', () => {
  const repository = { loadCatalogs: vi.fn(), create: vi.fn() };
  const messages = { success: vi.fn(), error: vi.fn(), warn: vi.fn() };
  let viewModel: ActivityEntryViewModel;

  beforeEach(() => {
    vi.clearAllMocks();
    repository.loadCatalogs.mockResolvedValue({
      machines: [],
      mixtures: [],
      boundary: [],
      zones: [],
      plants: [],
    });
    repository.create.mockResolvedValue({ entry_id: 'entry' });
    TestBed.configureTestingModule({
      providers: [
        ActivityEntryViewModel,
        { provide: ActivityEntryRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
      ],
    });
    viewModel = TestBed.inject(ActivityEntryViewModel);
  });

  it('loads the form catalogs', async () => {
    repository.loadCatalogs.mockResolvedValue({
      machines: [],
      mixtures: [],
      boundary: [],
      zones: [
        {
          id: 'zone-1',
          name: 'Zona A',
          coordinates: [
            { latitude: -23.4, longitude: -49.1 },
            { latitude: -23.4, longitude: -49.2 },
            { latitude: -23.5, longitude: -49.2 },
          ],
        },
      ],
      plants: [
        {
          id: 'plant-1',
          latitude: -23.45,
          longitude: -49.15,
          zoneId: 'zone-1',
        },
      ],
    });
    await viewModel.initialize();
    expect(repository.loadCatalogs).toHaveBeenCalledOnce();
    expect(viewModel.zones()).toHaveLength(1);
    expect(viewModel.plants()).toHaveLength(1);
    expect(viewModel.loading()).toBe(false);
  });

  it('requires a valid geometry before calling the RPC repository', async () => {
    const saved = await viewModel.submit({
      activity: 'Roçagem',
      performedAt: '2026-11-12T12:00:00.000Z',
      responsible: 'João',
    });
    expect(saved).toBe(false);
    expect(repository.create).not.toHaveBeenCalled();
    expect(messages.warn).toHaveBeenCalled();
  });

  it('submits all fields and clears the geometry after success', async () => {
    viewModel.setCoordinates([
      [-49.1, -23.4],
      [-49.2, -23.4],
      [-49.2, -23.5],
    ]);
    const saved = await viewModel.submit({
      activity: 'Roçagem',
      performedAt: '2026-11-12T12:00:00.000Z',
      responsible: 'João',
      mixtureId: 'mixture',
      machineId: 'machine',
    });
    expect(saved).toBe(true);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        geometryType: 'area',
        mixtureId: 'mixture',
        machineId: 'machine',
      }),
    );
    expect(viewModel.coordinates()).toEqual([]);
    expect(messages.success).toHaveBeenCalledWith(
      'Atividade registrada com sucesso!',
    );
  });
});
