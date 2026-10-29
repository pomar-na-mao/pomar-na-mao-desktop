import { describe, expect, it } from 'vitest';
import type { MachineItem, MachineDraft } from './machine.model';

describe('Machine Model Types', () => {
  it('should accept a complete machine item', () => {
    const item: MachineItem = {
      id: 'uuid-1',
      name: 'Trator Valtra A950',
      brand: 'Valtra',
      acquisition_date: '2024-05-10',
      manufacturing_year: 2023,
      quantity: 2,
      observations: 'Revisão a cada 250h',
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    };

    expect(item.id).toBe('uuid-1');
    expect(item.quantity).toBe(2);
    expect(item.brand).toBe('Valtra');
  });

  it('should accept a machine draft with only name and quantity', () => {
    const draft: MachineDraft = {
      name: 'Roçadeira',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    };

    expect(draft.name).toBe('Roçadeira');
    expect(draft.quantity).toBe(1);
    expect(draft.brand).toBeNull();
  });
});
