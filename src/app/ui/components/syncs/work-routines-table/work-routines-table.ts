import { Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { IWorkRoutine } from '../../../../domain/models/work-routine.model';
import { WorkRoutinesViewModel } from '../../../view-models/work-routine/work-routines.view-model';

@Component({
  selector: 'app-work-routines-table',
  imports: [CommonModule, TranslateModule, TitleCasePipe, DatePipe],
  templateUrl: './work-routines-table.html',
  styleUrl: './work-routines-table.scss',
})
export class WorkRoutinesTableComponent {
  private router = inject(Router);

  public workRoutinesViewModel = inject(WorkRoutinesViewModel);

  public onEditRoutine(routine: IWorkRoutine): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes/rotinas-de-trabalho/', routine.id]);
  }
}
