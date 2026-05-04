import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';
import { SprayingSessionMapComponent } from '../spraying-session-map/spraying-session-map';


@Component({
  selector: 'app-spraying-flow-detail-panel',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    SprayingSessionMapComponent,
  ],
  templateUrl: './spraying-flow-detail-panel.html',
})
export class SprayingFlowDetailPanelComponent {
  public viewModel = inject(SprayingFlowViewModel);

  public getStatusLabel(status: string | null | undefined): string {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'in_progress': return 'Em Andamento';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  }

  public formatOperatorName(name: string | null | undefined): string {
    if (!name) return 'Desconhecido';
    const parts = name.trim().split(/\s+/);
    if (parts.length <= 1) return name;
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
}
