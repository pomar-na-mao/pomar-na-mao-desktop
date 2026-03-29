import { Component, input, computed, inject } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import type { IInspectRoutine } from '../../../domain/models/inspect-routine.model';

@Component({
  selector: 'app-inspect-routines-table',
  imports: [CommonModule, TranslateModule, TitleCasePipe, DatePipe],
  templateUrl: './inspect-routines-table.html',
  styleUrl: './inspect-routines-table.scss',
})
export class InspectRoutinesTableComponent {
  private router = inject(Router);

  public routines = input<IInspectRoutine[]>([]);
  public isLoading = input<boolean>(false);

  public sortedRoutines = computed(() => {
    return [...this.routines()].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  });

  public onEditRoutine(routine: IInspectRoutine): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes/rotinas-de-inspecao/', routine.id]);
  }
}
