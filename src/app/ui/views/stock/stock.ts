import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { StockExcelService } from '../../../data/services/stock-excel/stock-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { StockItem } from '../../../domain/models/stock.model';
import { StockViewModel } from '../../view-models/stock/stock.view-model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Stock implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(StockViewModel);
  public confirmationService = inject(ConfirmationService);
  private excelService = inject(StockExcelService);
  private messageService = inject(MessageService);

  public ngOnInit(): void {
    void this.viewModel.loadInitialData();
  }

  public onGlobalFilter(event: Event): void {
    this.table?.filterGlobal(
      (event.target as HTMLInputElement).value,
      'contains',
    );
  }

  public onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.viewModel.selectPhoto(input.files?.[0] ?? null);
    input.value = '';
  }

  public confirmDelete(stockItem: StockItem): void {
    this.confirmationService.confirm({
      header: 'Excluir item do estoque',
      message: `Deseja realmente excluir “${stockItem.name}” do estoque?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteStockItems([stockItem]),
    });
  }

  public confirmDeleteSelected(): void {
    const selected = this.viewModel.selectedStockItems();
    if (selected.length === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir itens selecionados',
      message: `Deseja realmente excluir ${selected.length} item(ns) do estoque?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteStockItems(selected),
    });
  }

  public async exportExcel(): Promise<void> {
    const filtered = this.table?.filteredValue as StockItem[] | null | undefined;
    try {
      await this.excelService.export(filtered ?? this.viewModel.stockItems());
    } catch {
      this.messageService.error('Erro ao gerar o arquivo Excel.');
    }
  }
}
