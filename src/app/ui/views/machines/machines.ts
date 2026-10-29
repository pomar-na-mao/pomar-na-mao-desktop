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
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import type { MachineItem } from '../../../domain/models/machine.model';
import { MachinesViewModel } from '../../view-models/machines/machines.view-model';

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DatePickerModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputNumberModule,
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './machines.html',
  styleUrl: './machines.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Machines implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(MachinesViewModel);
  public confirmationService = inject(ConfirmationService);

  public ngOnInit(): void {
    void this.viewModel.loadInitialData();
  }

  public onGlobalFilter(event: Event): void {
    this.table?.filterGlobal(
      (event.target as HTMLInputElement).value,
      'contains',
    );
  }

  public confirmDelete(machine: MachineItem): void {
    this.confirmationService.confirm({
      header: 'Excluir máquina',
      message: `Deseja realmente excluir a máquina “${machine.name}”?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        void this.viewModel.deleteSingle(machine);
      },
    });
  }

  public confirmDeleteSelected(): void {
    const total = this.viewModel.selectedMachines().length;
    if (total === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir máquinas selecionadas',
      message:
        total === 1
          ? 'Deseja realmente excluir a máquina selecionada?'
          : `Deseja realmente excluir as ${total} máquinas selecionadas?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir selecionadas',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        void this.viewModel.deleteSelected();
      },
    });
  }

  public exportExcel(): void {
    void this.viewModel.exportExcel();
  }
}
