import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import type { SprayingSession } from '../../../../domain/models/spraying-session.model';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-sessions-table',
  imports: [CommonModule, TranslateModule, DatePipe, DecimalPipe, TitleCasePipe],
  templateUrl: './spraying-sessions-table.html',
  styleUrl: './spraying-sessions-table.scss',
})
export class SprayingSessionsTableComponent {
  public viewModel = inject(SprayingFlowViewModel);

  public async onSelectSession(session: SprayingSession): Promise<void> {
    await this.viewModel.selectSession(session.id);
  }
}
