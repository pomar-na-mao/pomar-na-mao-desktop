import { Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { IInspectRoutine } from '../../../../domain/models/inspect-routine.model';
import { InspectRoutinesViewModel } from '../../../view-models/inspect-routine/inspect-routines.view-model';

@Component({
  selector: 'app-inspect-routines-table',
  imports: [CommonModule, TranslateModule, TitleCasePipe, DatePipe],
  templateUrl: './inspect-routines-table.html',
  styleUrl: './inspect-routines-table.scss',
})
export class InspectRoutinesTableComponent {
  private router = inject(Router);

  public inspectRoutinesViewModel = inject(InspectRoutinesViewModel);

  public onEditRoutine(routine: IInspectRoutine): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes/rotinas-de-inspecao/', routine.id]);
  }
}
