import { describe, expect, it } from 'vitest';
import {
  MIPD_PLANT_PART_LABELS,
  MIPD_PLANT_PARTS,
  type MipdMarking,
  mipdPlantPartLabel,
} from './mipd.model';

describe('MIPD domain model', () => {
  it('maps every persisted plant part to its Portuguese label', () => {
    expect(MIPD_PLANT_PARTS).toEqual([
      'LEAF',
      'BRANCH',
      'TRUNK',
      'ROOT',
      'FRUIT',
    ]);
    expect(MIPD_PLANT_PART_LABELS).toEqual({
      LEAF: 'Folha',
      BRANCH: 'Ramo',
      TRUNK: 'Tronco',
      ROOT: 'Raiz',
      FRUIT: 'Fruto',
    });
    expect(MIPD_PLANT_PARTS.map(mipdPlantPartLabel)).toEqual([
      'Folha',
      'Ramo',
      'Tronco',
      'Raiz',
      'Fruto',
    ]);
  });

  it('represents the complete RPC row and a nullable photo path', () => {
    const marking: MipdMarking = {
      operation_id: 'operation-1',
      marking_id: 'marking-1',
      started_at: '2026-10-22T10:00:00Z',
      observed_at: '2026-10-22T10:01:00Z',
      plant_id: 'plant-1',
      latitude: -23.403,
      longitude: -49.149,
      zone_name: null,
      occurrence_type_id: 'occurrence-type-1',
      occurrence_type_name: 'Broca',
      plant_parts: ['LEAF', 'BRANCH'],
      photo_object_path: null,
    };

    expect(marking.photo_object_path).toBeNull();
    expect(marking.plant_parts).toEqual(['LEAF', 'BRANCH']);
    expect(Object.keys(marking)).toHaveLength(12);
  });
});

