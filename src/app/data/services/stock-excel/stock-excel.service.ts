import { Injectable } from '@angular/core';
import {
  type StockItem,
  stockTypeLabel,
} from '../../../domain/models/stock.model';

export interface StockExcelRow {
  ID: string;
  Nome: string;
  Tipo: string;
  'Princípio Ativo': string;
  Fabricante: string;
  Formulação: string;
  Concentração: string;
  'Registro MAPA': string;
  'Dose Bula': string;
  Quantidade: string | number;
  Unidade: string;
  'Carência (dias)': string | number;
  'Alvo 1': string;
  'Alvo 2': string;
  'Data de Validade': string;
  'Criado em': string;
  'Atualizado em': string;
  Observações: string;
}

@Injectable({ providedIn: 'root' })
export class StockExcelService {
  public buildRows(stockItems: StockItem[]): StockExcelRow[] {
    return stockItems.map((stockItem) => ({
      ID: stockItem.id,
      Nome: stockItem.name,
      Tipo: stockTypeLabel(stockItem.type),
      'Princípio Ativo': stockItem.active_ingredient ?? '—',
      Fabricante: stockItem.manufacturer ?? '—',
      Formulação: stockItem.formulation ?? '—',
      Concentração: stockItem.concentration ?? '—',
      'Registro MAPA': stockItem.mapa_registration ?? '—',
      'Dose Bula': stockItem.label_dose
        ? `${stockItem.label_dose}${stockItem.dose_unit ? ' ' + stockItem.dose_unit : ''}`
        : '—',
      Quantidade: stockItem.quantity ?? '—',
      Unidade: stockItem.unit ?? '—',
      'Carência (dias)':
        stockItem.safety_interval_days !== null
          ? stockItem.safety_interval_days
          : '—',
      'Alvo 1': stockItem.target_1 ?? '—',
      'Alvo 2': stockItem.target_2 ?? '—',
      'Data de Validade': stockItem.expiration_date
        ? this.formatDateOnly(stockItem.expiration_date)
        : '—',
      'Criado em': this.formatDateTime(stockItem.created_at),
      'Atualizado em': this.formatDateTime(stockItem.updated_at),
      Observações: stockItem.observations ?? '',
    }));
  }

  public buildFileName(now = new Date()): string {
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    return `estoque-${date}.xlsx`;
  }

  public async export(stockItems: StockItem[]): Promise<void> {
    const { default: writeXlsxFile } = await import(
      'write-excel-file/browser'
    );
    const columns = [
      {
        header: { value: 'ID', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.ID }),
        width: 38,
      },
      {
        header: { value: 'Nome', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Nome }),
        width: 30,
      },
      {
        header: { value: 'Tipo', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Tipo }),
        width: 22,
      },
      {
        header: { value: 'Princípio Ativo', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Princípio Ativo'] }),
        width: 25,
      },
      {
        header: { value: 'Fabricante', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Fabricante }),
        width: 22,
      },
      {
        header: { value: 'Formulação', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Formulação }),
        width: 14,
      },
      {
        header: { value: 'Dose Bula', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Dose Bula'] }),
        width: 18,
      },
      {
        header: { value: 'Quantidade', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Quantidade }),
        width: 14,
      },
      {
        header: { value: 'Unidade', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Unidade }),
        width: 12,
      },
      {
        header: { value: 'Carência (dias)', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({
          value:
            typeof row['Carência (dias)'] === 'number'
              ? row['Carência (dias)']
              : String(row['Carência (dias)']),
        }),
        width: 16,
      },
      {
        header: { value: 'Alvo 1 (Bula)', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Alvo 1'] }),
        width: 28,
      },
      {
        header: { value: 'Alvo 2 (Monitoramento)', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Alvo 2'] }),
        width: 28,
      },
      {
        header: { value: 'Validade', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Data de Validade'] }),
        width: 14,
      },
      {
        header: { value: 'Criado em', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Criado em'] }),
        width: 18,
      },
      {
        header: { value: 'Atualizado em', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row['Atualizado em'] }),
        width: 18,
      },
      {
        header: { value: 'Observações', fontWeight: 'bold' as const },
        cell: (row: StockExcelRow) => ({ value: row.Observações }),
        width: 35,
      },
    ];

    await writeXlsxFile(this.buildRows(stockItems), {
      columns,
      sheet: 'Estoque',
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
