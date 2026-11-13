import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MipdOperationItem } from '../../../domain/models/mipd-operation.model';
import { MipdService } from '../../services/mipd/mipd.service';
import { MipdRepository } from './mipd.repository';

describe('MipdRepository', () => {
  let repository: MipdRepository;
  const mockGetMipdOperations = vi.fn();
  const mockSyncMipdMarkings = vi.fn();
  const mockUploadPhoto = vi.fn();
  const mockCreateSignedPhotoUrl = vi.fn();
  const mockGetOccurrenceTypes = vi.fn();
  const mockGetZones = vi.fn();
  const mockGetPlants = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MipdRepository,
        {
          provide: MipdService,
          useValue: {
            getMipdOperations: mockGetMipdOperations,
            syncMipdMarkings: mockSyncMipdMarkings,
            uploadPhoto: mockUploadPhoto,
            createSignedPhotoUrl: mockCreateSignedPhotoUrl,
            getPestAndDiseaseOccurrenceTypes: mockGetOccurrenceTypes,
            getZones: mockGetZones,
            getPlants: mockGetPlants,
          },
        },
      ],
    });

    repository = TestBed.inject(MipdRepository);
  });

  it('initializes with empty signals', () => {
    expect(repository.operations()).toEqual([]);
    expect(repository.occurrenceTypes()).toEqual([]);
    expect(repository.zones()).toEqual([]);
    expect(repository.plants()).toEqual([]);
    expect(repository.isLoading()).toBe(false);
  });

  it('loads operations and updates signal', async () => {
    const mockItems: MipdOperationItem[] = [
      {
        operation_id: 'op-1',
        marking_id: 'mark-1',
        started_at: '2026-11-12T10:00:00Z',
        observed_at: '2026-11-12T09:00:00Z',
        plant_id: 'plant-1',
        latitude: -23.4,
        longitude: -49.1,
        zone_name: 'Talhão A',
        occurrence_type_id: 'occ-1',
        occurrence_type_name: 'Cancro',
        plant_parts: ['LEAF'],
        photo_object_path: null,
      },
    ];

    mockGetMipdOperations.mockResolvedValueOnce({
      data: mockItems,
      error: null,
    });

    const res = await repository.findAll({});
    expect(res.error).toBeNull();
    expect(repository.operations()).toEqual(mockItems);
  });

  it('submits marking without photo directly to sync RPC', async () => {
    mockSyncMipdMarkings.mockResolvedValueOnce({
      data: { markings: [{ markingId: 'm-1' }] },
      error: null,
    });

    const res = await repository.submitMarking({
      plantId: 'plant-1',
      occurrenceTypeId: 'occ-1',
      plantParts: ['LEAF', 'BRANCH'],
      observedAt: '2026-11-12T10:00:00Z',
    });

    expect(res.success).toBe(true);
    expect(mockUploadPhoto).not.toHaveBeenCalled();
    expect(mockSyncMipdMarkings).toHaveBeenCalledWith(
      expect.objectContaining({
        deviceId: 'desktop-web',
        markings: [
          expect.objectContaining({
            plantId: 'plant-1',
            occurrenceTypeId: 'occ-1',
            plantParts: ['LEAF', 'BRANCH'],
            photoObjectPath: null,
          }),
        ],
      }),
    );
  });

  it('uploads photo before submitting marking when photoFile is provided', async () => {
    mockUploadPhoto.mockResolvedValueOnce({
      path: 'user-1/desktop-web/mark-id.jpg',
      error: null,
    });
    mockSyncMipdMarkings.mockResolvedValueOnce({
      data: { markings: [{ markingId: 'm-1' }] },
      error: null,
    });

    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    const res = await repository.submitMarking({
      plantId: 'plant-1',
      occurrenceTypeId: 'occ-1',
      plantParts: ['FRUIT'],
      observedAt: '2026-11-12T10:00:00Z',
      photoFile: file,
    });

    expect(mockUploadPhoto).toHaveBeenCalled();
    expect(mockSyncMipdMarkings).toHaveBeenCalledWith(
      expect.objectContaining({
        markings: [
          expect.objectContaining({
            photoObjectPath: 'user-1/desktop-web/mark-id.jpg',
          }),
        ],
      }),
    );
    expect(res.success).toBe(true);
  });

  it('fails submission if photo upload fails', async () => {
    mockUploadPhoto.mockResolvedValueOnce({
      path: null,
      error: new Error('Network timeout'),
    });

    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    const res = await repository.submitMarking({
      plantId: 'plant-1',
      occurrenceTypeId: 'occ-1',
      plantParts: ['FRUIT'],
      observedAt: '2026-11-12T10:00:00Z',
      photoFile: file,
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Network timeout');
    expect(mockSyncMipdMarkings).not.toHaveBeenCalled();
  });
});
