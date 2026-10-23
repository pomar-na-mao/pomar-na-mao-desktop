import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { OccurrenceTypeExcelService } from './occurrence-type-excel.service';

describe('OccurrenceTypeExcelService', () => {
  const service = TestBed.inject(OccurrenceTypeExcelService);
  const item: OccurrenceType = {
    id: '47c97f71-8e3f-466f-b62c-737d1982f621',
    name: 'Ácaros',
    code: 'mites',
    category: 'PEST_DISEASE',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };

  it('builds all persisted user-facing columns without actions', () => {
    const rows = service.buildRows([item]);

    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0])).toEqual([
      'ID',
      'Nome',
      'Código',
      'Categoria',
      'Criado em',
      'Atualizado em',
    ]);
    expect(rows[0].ID).toBe(item.id);
    expect(rows[0].Código).toBe('mites');
    expect(rows[0].Categoria).toBe('Praga ou doença');
    expect(rows[0]).not.toHaveProperty('selection');
    expect(rows[0]).not.toHaveProperty('actions');
  });

  it('preserves invalid date values for diagnosis', () => {
    const [row] = service.buildRows([
      { ...item, created_at: 'invalid-date', updated_at: 'invalid-date' },
    ]);

    expect(row['Criado em']).toBe('invalid-date');
    expect(row['Atualizado em']).toBe('invalid-date');
  });

  it('labels legacy records without a category', () => {
    const [row] = service.buildRows([{ ...item, category: null }]);

    expect(row.Categoria).toBe('Não classificada');
  });

  it('creates a dated xlsx filename', () => {
    expect(service.buildFileName(new Date(2026, 9, 20))).toBe(
      'ocorrencias-2026-10-20.xlsx',
    );
  });
});
