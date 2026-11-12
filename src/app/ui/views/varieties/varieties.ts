import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MapPolygonSelector } from '../../components/map-polygon-selector/map-polygon-selector';
import type { PolygonSelection } from '../../../domain/models/map-polygon.model';
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
    InputTextModule,
    TableModule,
    TextareaModule,
    TooltipModule,
    MapPolygonSelector,
  ],
  providers: [ConfirmationService],
  templateUrl: './varieties.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class Varieties implements OnInit, OnDestroy {
  public viewModel = inject(VarietiesViewModel);
  public confirmationService = inject(ConfirmationService);

  @ViewChild(MapPolygonSelector) public mapSelector?: MapPolygonSelector;

  public async ngOnInit(): Promise<void> {
    await this.viewModel.loadInitialData();
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public onPolygonSelected(event: PolygonSelection): void {
    this.viewModel.onPolygonSelected(event.coordinates);
  }

  public onPolygonCleared(): void {
    this.viewModel.onPolygonCleared();
  }

  public async onSubmitCreate(): Promise<void> {
    await this.viewModel.saveNewVariety();
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
      accept: () => void this.viewModel.deleteVariety(variety),
    });
  }

  public toggleFullscreen(): void {
    const nextValue = !this.viewModel.isMapFullscreen();
    this.viewModel.isMapFullscreen.set(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    setTimeout(() => {
      this.mapSelector?.invalidateSize();
    }, 50);
  }
}
