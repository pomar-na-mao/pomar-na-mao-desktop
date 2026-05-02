import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import type { SprayingSession } from '../../../../domain/models/spraying-session.model';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-sessions-table',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './spraying-sessions-table.html',
})
export class SprayingSessionsTableComponent {
  public viewModel = inject(SprayingFlowViewModel);

  public async onSelectSession(session: SprayingSession): Promise<void> {
    await this.viewModel.selectSession(session.id);
  }

  public getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Andamento';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  }
}
