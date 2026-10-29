import { Injectable } from '@angular/core';
import type { MachineItem } from '../../../domain/models/machine.model';

export interface MachineExcelRow {
  Nome: string;
  Marca: string;
  'Data de Aquisição': string;
  'Ano de Fabricação': string;
  Quantidade: number;
  Observações: string;
  'Criado em': string;
  'Atualizado em': string;
}

@Injectable({ providedIn: 'root' })
export class MachineExcelService {
  public buildRows(machines: MachineItem[]): MachineExcelRow[] {
    return machines.map((machine) => ({
      Nome: machine.name,
      Marca: machine.brand ?? '',
      'Data de Aquisição': this.formatDate(machine.acquisition_date),
      'Ano de Fabricação': machine.manufacturing_year ? String(machine.manufacturing_year) : '',
      Quantidade: machine.quantity ?? 1,
      Observações: machine.observations ?? '',
      'Criado em': this.formatDateTime(machine.created_at),
      'Atualizado em': this.formatDateTime(machine.updated_at),
    }));
  }

  public buildFileName(now = new Date()): string {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return `maquinas-${date}.xlsx`;
  }

  public async export(machines: MachineItem[]): Promise<void> {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');

    const columns = [
      {
        header: { value: 'Nome', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row.Nome }),
        width: 30,
      },
      {
        header: { value: 'Marca', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row.Marca }),
        width: 22,
      },
      {
        header: { value: 'Data de Aquisição', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row['Data de Aquisição'] }),
        width: 18,
      },
      {
        header: { value: 'Ano de Fabricação', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row['Ano de Fabricação'] }),
        width: 18,
      },
      {
        header: { value: 'Quantidade', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row.Quantidade }),
        width: 14,
      },
      {
        header: { value: 'Observações', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row.Observações }),
        width: 36,
      },
      {
        header: { value: 'Criado em', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row['Criado em'] }),
        width: 20,
      },
      {
        header: { value: 'Atualizado em', fontWeight: 'bold' as const },
        cell: (row: MachineExcelRow) => ({ value: row['Atualizado em'] }),
        width: 20,
      },
    ];

    await writeXlsxFile(this.buildRows(machines), {
      columns,
      sheet: 'Máquinas',
    }).toFile(this.buildFileName());
  }

  private formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    try {
      const parts = iso.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR');
    } catch {
      return iso ?? '';
    }
  }

  private formatDateTime(iso: string | null | undefined): string {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleString('pt-BR');
    } catch {
      return iso ?? '';
    }
  }
}
