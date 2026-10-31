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
import { InputExcelService } from '../../../data/services/input-excel/input-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { InputItem } from '../../../domain/models/input.model';
import { InputsViewModel } from '../../view-models/inputs/inputs.view-model';

@Component({
  selector: 'app-inputs',
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
  templateUrl: './inputs.html',
  styleUrl: './inputs.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Inputs implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(InputsViewModel);
  public confirmationService = inject(ConfirmationService);
  private excelService = inject(InputExcelService);
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

  public confirmDelete(input: InputItem): void {
    this.confirmationService.confirm({
      header: 'Excluir insumo',
      message: `Deseja realmente excluir o insumo “${input.name}”?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteInputs([input]),
    });
  }

  public confirmDeleteSelected(): void {
    const selected = this.viewModel.selectedInputs();
    if (selected.length === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir insumos selecionados',
      message: `Deseja realmente excluir ${selected.length} insumo(s)?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteInputs(selected),
    });
  }

  public async exportExcel(): Promise<void> {
    const filtered = this.table?.filteredValue as InputItem[] | null | undefined;
    try {
      await this.excelService.export(filtered ?? this.viewModel.inputs());
    } catch {
      this.messageService.error('Erro ao gerar o arquivo Excel.');
    }
  }
}
