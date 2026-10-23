import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Variety } from '../../../domain/models/variety.model';
import { VarietyExcelService } from './variety-excel.service';

describe('VarietyExcelService', () => {
  const service = TestBed.inject(VarietyExcelService);
  const item: Variety = {
    id: 99,
    name: 'Hass',
    description: null,
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };

  it('builds only the required user-facing columns', () => {
    const rows = service.buildRows([item]);

    expect(rows).toHaveLength(1);
    expect(Object.keys(rows[0])).toEqual([
      'Nome',
      'Descrição',
      'Criado em',
      'Atualizado em',
    ]);
    expect(rows[0].Nome).toBe('Hass');
    expect(rows[0].Descrição).toBe('');
    expect(rows[0]).not.toHaveProperty('id');
    expect(rows[0]).not.toHaveProperty('actions');
  });

  it('creates a dated xlsx filename', () => {
    expect(service.buildFileName(new Date(2026, 9, 20))).toBe(
      'variedades-2026-10-20.xlsx',
    );
  });
});
