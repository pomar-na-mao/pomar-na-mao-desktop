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
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { OccurrenceTypeExcelService } from '../../../data/services/occurrence-type-excel/occurrence-type-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { OccurrencesViewModel } from '../../view-models/occurrences/occurrences.view-model';

@Component({
  selector: 'app-occurrences',
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
    SelectModule,
    TableModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './occurrences.html',
  styleUrl: './occurrences.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Occurrences implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(OccurrencesViewModel);
  public confirmationService = inject(ConfirmationService);
  private excelService = inject(OccurrenceTypeExcelService);
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

  public confirmDelete(occurrenceType: OccurrenceType): void {
    this.confirmationService.confirm({
      header: 'Excluir ocorrência',
      message: `Deseja realmente excluir a ocorrência “${occurrenceType.name}”? Registros associados podem impedir a exclusão ou ficar sem o tipo de ocorrência.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteOccurrenceTypes([occurrenceType]),
    });
  }

  public confirmDeleteSelected(): void {
    const selected = this.viewModel.selectedOccurrenceTypes();
    if (selected.length === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir ocorrências selecionadas',
      message: `Deseja realmente excluir ${selected.length} ocorrência(s)? Registros associados podem impedir a exclusão ou ficar sem o tipo de ocorrência.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteOccurrenceTypes(selected),
    });
  }

  public async exportExcel(): Promise<void> {
    const filtered = this.table?.filteredValue as
      OccurrenceType[] | null | undefined;
    try {
      await this.excelService.export(
        filtered ?? this.viewModel.occurrenceTypes(),
      );
    } catch {
      this.messageService.error('Erro ao gerar o arquivo Excel.');
    }
  }
}
