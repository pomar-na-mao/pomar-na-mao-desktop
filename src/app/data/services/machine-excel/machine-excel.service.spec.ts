import { describe, expect, it } from 'vitest';
import type { MachineItem } from '../../../domain/models/machine.model';
import { MachineExcelService } from './machine-excel.service';

describe('MachineExcelService', () => {
  const service = new MachineExcelService();

  const sampleMachines: MachineItem[] = [
    {
      id: 'm-1',
      name: 'Trator A950',
      brand: 'Valtra',
      acquisition_date: '2024-03-15',
      manufacturing_year: 2023,
      quantity: 2,
      observations: 'Em operação',
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    },
  ];

  it('builds formatted excel rows correctly', () => {
    const rows = service.buildRows(sampleMachines);
    expect(rows.length).toBe(1);
    expect(rows[0].Nome).toBe('Trator A950');
    expect(rows[0].Marca).toBe('Valtra');
    expect(rows[0]['Data de Aquisição']).toBe('15/03/2024');
    expect(rows[0]['Ano de Fabricação']).toBe('2023');
    expect(rows[0].Quantidade).toBe(2);
    expect(rows[0].Observações).toBe('Em operação');
  });

  it('builds filename with current date', () => {
    const fixedDate = new Date(2026, 9, 29);
    expect(service.buildFileName(fixedDate)).toBe('maquinas-2026-10-29.xlsx');
  });
});
