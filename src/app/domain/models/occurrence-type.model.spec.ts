import { describe, expect, it } from 'vitest';
import {
  OCCURRENCE_CATEGORIES,
  type OccurrenceType,
  type OccurrenceTypeCreate,
  type OccurrenceTypeDraft,
  type OccurrenceTypeUpdate,
} from './occurrence-type.model';

describe('OccurrenceType model', () => {
  it('exposes the same category values as the database enum', () => {
    expect(OCCURRENCE_CATEGORIES).toEqual([
      'STRUCTURAL',
      'ENVIRONMENTAL',
      'PEST_DISEASE',
      'ANTHROPIC',
    ]);
  });

  it('represents persisted and writable occurrence type fields', () => {
    const persisted = {
      id: '47c97f71-8e3f-466f-b62c-737d1982f621',
      name: 'Ácaros',
      code: 'mites',
      category: 'PEST_DISEASE',
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    } satisfies OccurrenceType;
    const create = {
      name: 'Tripes',
      code: 'thrips',
      category: 'PEST_DISEASE',
      created_at: '2026-10-20T10:05:00Z',
      updated_at: '2026-10-20T10:05:00Z',
    } satisfies OccurrenceTypeCreate;
    const update = {
      name: 'Presença de tripes',
      code: 'thrips',
      category: 'PEST_DISEASE',
      updated_at: '2026-10-20T10:10:00Z',
    } satisfies OccurrenceTypeUpdate;
    const draft = {
      name: 'Broca',
      code: 'drill',
      category: 'PEST_DISEASE',
    } satisfies OccurrenceTypeDraft;

    expect(persisted.id).toBe('47c97f71-8e3f-466f-b62c-737d1982f621');
    expect(create.created_at).toBe(create.updated_at);
    expect(update).not.toHaveProperty('created_at');
    expect(draft.code).toBe('drill');
  });
});
