import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import type { IRoutine } from '../../../../domain/models/routine.model';
import { RoutinesViewModel } from '../../../view-models/routine/routines.view-model';

@Component({
  selector: 'app-routines-table',
  imports: [CommonModule, TitleCasePipe, DatePipe],
  templateUrl: './routines-table.html',
  styleUrl: './routines-table.scss',
})
export class RoutinesTableComponent {
  private router = inject(Router);

  public routinesViewModel = inject(RoutinesViewModel);

  public onEditRoutine(routine: IRoutine): void {
    this.router.navigate(['/sincronizacoes/rotinas', routine.id]);
  }
}
