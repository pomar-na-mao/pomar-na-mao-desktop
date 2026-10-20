import { describe, expect, it } from 'vitest';
import type {
  Variety,
  VarietyCreate,
  VarietyDraft,
  VarietyUpdate,
} from './variety.model';

describe('Variety model', () => {
  it('represents persisted and writable variety fields', () => {
    const persisted = {
      id: 7,
      name: 'Hass',
      description: null,
      created_at: '2026-10-20T10:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    } satisfies Variety;
    const create = {
      name: 'Breda',
      description: 'Variedade de abacate',
      created_at: '2026-10-20T10:05:00Z',
      updated_at: '2026-10-20T10:05:00Z',
    } satisfies VarietyCreate;
    const update = {
      name: 'Breda melhorada',
      description: null,
      updated_at: '2026-10-20T10:10:00Z',
    } satisfies VarietyUpdate;
    const draft = {
      name: 'Geada',
      description: null,
    } satisfies VarietyDraft;

    expect(persisted.id).toBe(7);
    expect(create).toEqual({
      name: 'Breda',
      description: 'Variedade de abacate',
      created_at: '2026-10-20T10:05:00Z',
      updated_at: '2026-10-20T10:05:00Z',
    });
    expect(update.description).toBeNull();
    expect(draft.name).toBe('Geada');
  });
});
