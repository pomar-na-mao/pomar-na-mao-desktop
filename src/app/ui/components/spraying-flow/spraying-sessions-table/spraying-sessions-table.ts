import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import type { SprayingSession } from '../../../../domain/models/spraying-session.model';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-sessions-table',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
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

  public getSessionDuration(session: SprayingSession): string {
    if (!session.started_at || !session.ended_at) {
      return '--:--';
    }
    const start = new Date(session.started_at).getTime();
    const end = new Date(session.ended_at).getTime();
    const diffMs = end - start;

    if (diffMs < 0) return '--:--';

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m ${diffSecs}s`;
    }
    return `${diffMins}m ${diffSecs}s`;
  }
}
