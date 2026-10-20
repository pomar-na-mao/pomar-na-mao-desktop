import { Injectable } from '@angular/core';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { occurrenceCategoryLabel } from '../../../shared/utils/occurrence-category';

export interface OccurrenceTypeExcelRow {
  ID: string;
  Nome: string;
  Código: string;
  Categoria: string;
  'Criado em': string;
  'Atualizado em': string;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceTypeExcelService {
  public buildRows(
    occurrenceTypes: OccurrenceType[],
  ): OccurrenceTypeExcelRow[] {
    return occurrenceTypes.map((occurrenceType) => ({
      ID: occurrenceType.id,
      Nome: occurrenceType.name,
      Código: occurrenceType.code,
      Categoria: occurrenceCategoryLabel(occurrenceType.category),
      'Criado em': this.formatDate(occurrenceType.created_at),
      'Atualizado em': this.formatDate(occurrenceType.updated_at),
    }));
  }

  public buildFileName(now = new Date()): string {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return `ocorrencias-${date}.xlsx`;
  }

  public async export(occurrenceTypes: OccurrenceType[]): Promise<void> {
    const { default: writeXlsxFile } = await import(
      'write-excel-file/browser'
    );
    const columns = [
      {
        header: { value: 'ID', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row.ID }),
        width: 38,
      },
      {
        header: { value: 'Nome', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row.Nome }),
        width: 30,
      },
      {
        header: { value: 'Código', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row.Código }),
        width: 24,
      },
      {
        header: { value: 'Categoria', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row.Categoria }),
        width: 22,
      },
      {
        header: { value: 'Criado em', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row['Criado em'] }),
        width: 20,
      },
      {
        header: { value: 'Atualizado em', fontWeight: 'bold' as const },
        cell: (row: OccurrenceTypeExcelRow) => ({ value: row['Atualizado em'] }),
        width: 20,
      },
    ];

    await writeXlsxFile(this.buildRows(occurrenceTypes), {
      columns,
      sheet: 'Ocorrências',
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
