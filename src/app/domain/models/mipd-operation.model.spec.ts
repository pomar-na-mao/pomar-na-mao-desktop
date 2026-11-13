import { describe, expect, it } from 'vitest';
import {
  formatMipdPlantParts,
  MIPD_PLANT_PART_LABELS,
  MIPD_PLANT_PARTS,
  mipdPlantPartLabel,
  type MipdOperationItem,
  type MipdSyncPayload,
} from './mipd-operation.model';

describe('mipd-operation.model', () => {
  it('exposes all 5 MIPD plant parts and their Portuguese labels', () => {
    expect(MIPD_PLANT_PARTS).toEqual(['LEAF', 'BRANCH', 'TRUNK', 'ROOT', 'FRUIT']);
    expect(MIPD_PLANT_PART_LABELS.LEAF).toBe('Folha');
    expect(MIPD_PLANT_PART_LABELS.BRANCH).toBe('Ramo');
    expect(MIPD_PLANT_PART_LABELS.TRUNK).toBe('Tronco');
    expect(MIPD_PLANT_PART_LABELS.ROOT).toBe('Raiz');
    expect(MIPD_PLANT_PART_LABELS.FRUIT).toBe('Fruto');
  });

  it('translates single and multiple plant parts correctly', () => {
    expect(mipdPlantPartLabel('LEAF')).toBe('Folha');
    expect(formatMipdPlantParts(['LEAF', 'FRUIT'])).toBe('Folha, Fruto');
    expect(formatMipdPlantParts([])).toBe('');
  });

  it('accepts compliant MipdOperationItem and MipdSyncPayload structures', () => {
    const item: MipdOperationItem = {
      operation_id: 'op-1',
      marking_id: 'mark-1',
      started_at: '2026-11-12T10:00:00Z',
      observed_at: '2026-11-12T09:30:00Z',
      plant_id: 'plant-1',
      latitude: -23.403,
      longitude: -49.149,
      zone_name: 'Talhão A',
      occurrence_type_id: 'occ-1',
      occurrence_type_name: 'Cancro Cítrico',
      plant_parts: ['LEAF', 'BRANCH'],
      photo_object_path: 'anonymous/device-1/mark-1.jpg',
    };
    expect(item.plant_parts.length).toBe(2);

    const payload: MipdSyncPayload = {
      deviceId: 'desktop-web-1',
      markings: [
        {
          localMarkingId: 'local-1',
          plantId: 'plant-1',
          occurrenceTypeId: 'occ-1',
          plantParts: ['LEAF'],
          observedAt: '2026-11-12T10:00:00Z',
          photoObjectPath: null,
        },
      ],
    };
    expect(payload.markings[0].localMarkingId).toBe('local-1');
  });
});
