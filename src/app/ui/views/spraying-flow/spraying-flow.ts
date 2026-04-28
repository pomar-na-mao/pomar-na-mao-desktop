import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SprayingFlowDetailPanelComponent } from '../../components/spraying-flow/spraying-flow-detail-panel/spraying-flow-detail-panel';
import { SprayingSessionsTableComponent } from '../../components/spraying-flow/spraying-sessions-table/spraying-sessions-table';
import { SprayingFlowViewModel } from '../../view-models/spraying-flow/spraying-flow.view-model';

@Component({
  selector: 'app-spraying-flow',
  imports: [
    CommonModule,
    TranslateModule,
    SprayingSessionsTableComponent,
    SprayingFlowDetailPanelComponent,
  ],
  templateUrl: './spraying-flow.html',
  styleUrls: ['./spraying-flow.scss'],
  providers: [SprayingFlowViewModel],
})
export class SprayingFlow implements OnInit {
  public viewModel = inject(SprayingFlowViewModel);

  public async ngOnInit(): Promise<void> {
    await this.viewModel.loadSessions();
  }
}
