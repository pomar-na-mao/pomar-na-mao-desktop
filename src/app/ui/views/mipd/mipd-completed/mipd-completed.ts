import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  mipdPlantPartLabel,
  type MipdPlantPart,
} from '../../../../domain/models/mipd-operation.model';
import { type SelectOption } from '../../../../shared/components/select/select';
import { MipdCompletedViewModel } from '../../../view-models/mipd/mipd-completed.view-model';

@Component({
  selector: 'app-mipd-completed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SelectModule,
    DialogModule,
    TooltipModule,
  ],
  providers: [MipdCompletedViewModel, MessageService],
  templateUrl: './mipd-completed.html',
  styleUrl: './mipd-completed.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class MipdCompleted implements OnInit, OnDestroy {
  public viewModel = inject(MipdCompletedViewModel);

  public get zoneFilterOptions(): SelectOption[] {
    return [
      { label: 'Todos os talhões', value: '' },
      ...this.viewModel.zones().map((z) => ({
        label: z.name,
        value: z.name,
      })),
    ];
  }

  public get occurrenceTypeFilterOptions(): SelectOption[] {
    return [
      { label: 'Todas as ocorrências', value: '' },
      ...this.viewModel.occurrenceTypes().map((occ) => ({
        label: occ.name,
        value: occ.id,
      })),
    ];
  }

  public ngOnInit(): void {
    void this.viewModel.loadInitialData();
  }

  public ngOnDestroy(): void {
    this.viewModel.destroyMap();
    this.viewModel.destroyMiniMap();
  }

  public setViewMode(mode: 'table' | 'map'): void {
    this.viewModel.viewMode.set(mode);
    if (mode === 'map') {
      this.initFullMapIfNeeded();
    }
  }

  public initFullMapIfNeeded(): void {
    setTimeout(() => {
      this.viewModel.initMap('mipd-main-map');
      this.viewModel.invalidateMapSize();
    }, 100);
  }

  public onDetailsShown(): void {
    const item = this.viewModel.selectedItem();
    if (item) {
      this.viewModel.initMiniMap('mipd-mini-map', item);
    }
  }

  public onDialogVisibleChange(visible: boolean): void {
    if (!visible) {
      this.viewModel.closeDetails();
    }
  }

  public onZoneFilterChange(zoneName: string): void {
    this.viewModel.selectedZoneId.set(zoneName || '');
  }

  public onOccurrenceTypeFilterChange(occId: string): void {
    this.viewModel.selectedOccurrenceTypeId.set(occId || '');
  }

  public onDateChange(type: 'start' | 'end', value: string): void {
    if (type === 'start') {
      this.viewModel.startDate.set(value || '');
    } else {
      this.viewModel.endDate.set(value || '');
    }
    void this.viewModel.fetchData();
  }

  public getPartLabel(part: MipdPlantPart | string): string {
    return mipdPlantPartLabel(part as MipdPlantPart);
  }
}
