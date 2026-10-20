import { Injectable } from '@angular/core';
import type { Variety } from '../../../domain/models/variety.model';

export interface VarietyExcelRow {
  Nome: string;
  Descrição: string;
  'Criado em': string;
  'Atualizado em': string;
}

@Injectable({ providedIn: 'root' })
export class VarietyExcelService {
  public buildRows(varieties: Variety[]): VarietyExcelRow[] {
    return varieties.map((variety) => ({
      Nome: variety.name,
      Descrição: variety.description ?? '',
      'Criado em': this.formatDate(variety.created_at),
      'Atualizado em': this.formatDate(variety.updated_at),
    }));
  }

  public buildFileName(now = new Date()): string {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return `variedades-${date}.xlsx`;
  }

  public async export(varieties: Variety[]): Promise<void> {
    const { default: writeXlsxFile } = await import(
      'write-excel-file/browser'
    );
    const columns = [
      {
        header: { value: 'Nome', fontWeight: 'bold' as const },
        cell: (row: VarietyExcelRow) => ({ value: row.Nome }),
        width: 28,
      },
      {
        header: { value: 'Descrição', fontWeight: 'bold' as const },
        cell: (row: VarietyExcelRow) => ({ value: row.Descrição }),
        width: 48,
      },
      {
        header: { value: 'Criado em', fontWeight: 'bold' as const },
        cell: (row: VarietyExcelRow) => ({ value: row['Criado em'] }),
        width: 20,
      },
      {
        header: { value: 'Atualizado em', fontWeight: 'bold' as const },
        cell: (row: VarietyExcelRow) => ({ value: row['Atualizado em'] }),
        width: 20,
      },
    ];

    await writeXlsxFile(this.buildRows(varieties), {
      columns,
      sheet: 'Variedades',
    }).toFile(this.buildFileName());
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }
}
