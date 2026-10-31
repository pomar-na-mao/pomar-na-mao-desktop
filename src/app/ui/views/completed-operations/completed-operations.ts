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
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { FieldActivitiesViewModel } from '../../view-models/field-activities/field-activities.view-model';

@Component({
  selector: 'app-completed-operations',
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
    DatePickerModule,
    DialogModule,
    TooltipModule,
  ],
  providers: [FieldActivitiesViewModel, MessageService],
  templateUrl: './completed-operations.html',
  styleUrl: './completed-operations.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class CompletedOperations implements OnInit, OnDestroy {
  public viewModel = inject(FieldActivitiesViewModel);

  public geometryOptions = [
    { label: 'Todos os tipos', value: 'all' },
    { label: 'Apenas Rotas', value: 'route' },
    { label: 'Apenas Áreas', value: 'area' },
  ];

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
      this.viewModel.initMap('activities-main-map');
      this.viewModel.invalidateMapSize();
    }, 100);
  }

  public onDetailsShown(): void {
    const act = this.viewModel.selectedActivity();
    if (act) {
      this.viewModel.initMiniMap('activity-mini-map', act);
    }
  }
}
