import { Injectable } from '@angular/core';
import {
  type InputItem,
  inputTypeLabel,
} from '../../../domain/models/input.model';

export interface InputExcelRow {
  ID: string;
  Nome: string;
  Tipo: string;
  'Princípio Ativo': string;
  Fabricante: string;
  Formulação: string;
  Concentração: string;
  'Registro MAPA': string;
  'Dose Bula': string;
  'Carência (dias)': string | number;
  'Alvo 1': string;
  'Alvo 2': string;
  'Data de Validade': string;
  'Criado em': string;
  'Atualizado em': string;
  Observações: string;
}

@Injectable({ providedIn: 'root' })
export class InputExcelService {
  public buildRows(inputs: InputItem[]): InputExcelRow[] {
    return inputs.map((input) => ({
      ID: input.id,
      Nome: input.name,
      Tipo: inputTypeLabel(input.type),
      'Princípio Ativo': input.active_ingredient ?? '—',
      Fabricante: input.manufacturer ?? '—',
      Formulação: input.formulation ?? '—',
      Concentração: input.concentration ?? '—',
      'Registro MAPA': input.mapa_registration ?? '—',
      'Dose Bula': input.label_dose
        ? `${input.label_dose}${input.dose_unit ? ' ' + input.dose_unit : ''}`
        : '—',
      'Carência (dias)':
        input.safety_interval_days !== null
          ? input.safety_interval_days
          : '—',
      'Alvo 1': input.target_1 ?? '—',
      'Alvo 2': input.target_2 ?? '—',
      'Data de Validade': input.expiration_date
        ? this.formatDateOnly(input.expiration_date)
        : '—',
      'Criado em': this.formatDateTime(input.created_at),
      'Atualizado em': this.formatDateTime(input.updated_at),
      Observações: input.observations ?? '',
    }));
  }

  public buildFileName(now = new Date()): string {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return `insumos-${date}.xlsx`;
  }

  public async export(inputs: InputItem[]): Promise<void> {
    const { default: writeXlsxFile } = await import(
      'write-excel-file/browser'
    );
    const columns = [
      {
        header: { value: 'ID', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.ID }),
        width: 38,
      },
      {
        header: { value: 'Nome', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.Nome }),
        width: 30,
      },
      {
        header: { value: 'Tipo', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.Tipo }),
        width: 22,
      },
      {
        header: { value: 'Princípio Ativo', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Princípio Ativo'] }),
        width: 25,
      },
      {
        header: { value: 'Fabricante', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.Fabricante }),
        width: 22,
      },
      {
        header: { value: 'Formulação', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.Formulação }),
        width: 14,
      },
      {
        header: { value: 'Dose Bula', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Dose Bula'] }),
        width: 18,
      },
      {
        header: { value: 'Carência (dias)', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({
          value:
            typeof row['Carência (dias)'] === 'number'
              ? row['Carência (dias)']
              : String(row['Carência (dias)']),
        }),
        width: 16,
      },
      {
        header: { value: 'Alvo 1 (Bula)', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Alvo 1'] }),
        width: 28,
      },
      {
        header: { value: 'Alvo 2 (Monitoramento)', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Alvo 2'] }),
        width: 28,
      },
      {
        header: { value: 'Validade', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Data de Validade'] }),
        width: 14,
      },
      {
        header: { value: 'Criado em', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Criado em'] }),
        width: 18,
      },
      {
        header: { value: 'Atualizado em', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row['Atualizado em'] }),
        width: 18,
      },
      {
        header: { value: 'Observações', fontWeight: 'bold' as const },
        cell: (row: InputExcelRow) => ({ value: row.Observações }),
        width: 35,
      },
    ];

    await writeXlsxFile(this.buildRows(inputs), {
      columns,
      sheet: 'Insumos',
    }).toFile(this.buildFileName());
  }

  private formatDateTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('pt-BR');
  }

  private formatDateOnly(dateStr: string): string {
    if (!dateStr) return '—';
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }
}
