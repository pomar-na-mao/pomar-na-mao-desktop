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
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import type { MixtureItem } from '../../../domain/models/mixture.model';
import { MixturesViewModel } from '../../view-models/mixtures/mixtures.view-model';

@Component({
  selector: 'app-mixtures',
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
    InputTextModule,
    SelectModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './mixtures.html',
  styleUrl: './mixtures.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Mixtures implements OnInit {
  @ViewChild('dt') public table?: Table;

  public viewModel = inject(MixturesViewModel);
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

  public confirmDelete(mixture: MixtureItem): void {
    this.confirmationService.confirm({
      header: 'Excluir calda',
      message: `Deseja realmente excluir a calda “${mixture.name}”?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteSingle(mixture),
    });
  }

  public confirmDeleteSelected(): void {
    const selected = this.viewModel.selectedMixtures();
    if (selected.length === 0) return;

    this.confirmationService.confirm({
      header: 'Excluir caldas selecionadas',
      message: `Deseja realmente excluir ${selected.length} calda(s)?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger', outlined: true },
      rejectButtonProps: { outlined: true },
      accept: () => void this.viewModel.deleteSelected(),
    });
  }
}
