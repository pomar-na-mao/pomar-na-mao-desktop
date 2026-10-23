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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { VarietyExcelService } from '../../../data/services/variety-excel/variety-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { Variety } from '../../../domain/models/variety.model';
import { VarietiesViewModel } from '../../view-models/varieties/varieties.view-model';

@Component({
  selector: 'app-varieties',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './varieties.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Varieties implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(VarietiesViewModel);
  public confirmationService = inject(ConfirmationService);
  private excelService = inject(VarietyExcelService);
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

  public confirmDelete(variety: Variety): void {
    this.confirmationService.confirm({
      header: 'Excluir variedade',
      message: `Deseja realmente excluir a variedade “${variety.name}”? Plantas associadas ficarão sem variedade.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteVarieties([variety]),
    });
  }

  public confirmDeleteSelected(): void {
    const selected = this.viewModel.selectedVarieties();
    if (selected.length === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir variedades selecionadas',
      message: `Deseja realmente excluir ${selected.length} variedade(s)? Plantas associadas ficarão sem variedade.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteVarieties(selected),
    });
  }

  public async exportExcel(): Promise<void> {
    const filtered = this.table?.filteredValue as Variety[] | null | undefined;
    try {
      await this.excelService.export(filtered ?? this.viewModel.varieties());
    } catch {
      this.messageService.error('Erro ao gerar o arquivo Excel.');
    }
  }
}
