import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { IRoutine } from '../../../../domain/models/routine.model';
import { RoutinesViewModel } from '../../../view-models/routine/routines.view-model';
import { RoutineDetail } from '../../../views/routine-detail/routine-detail';

@Component({
  selector: 'app-routines-table',
  imports: [CommonModule, TitleCasePipe, DatePipe, RoutineDetail],
  templateUrl: './routines-table.html',
  styleUrl: './routines-table.scss',
})
export class RoutinesTableComponent {
  private router = inject(Router);

  public routinesViewModel = inject(RoutinesViewModel);

  public isModalOpen = signal(false);
  public selectedId = signal<number | null>(null);
  public selectedRegion = signal<string | null>(null);

  public onEditRoutine(routine: IRoutine): void {
    this.selectedId.set(routine.id);
    this.selectedRegion.set(routine.region);
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedId.set(null);
    this.selectedRegion.set(null);
  }
}
