import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SprayingFlowViewModel } from '../../../view-models/spraying-flow/spraying-flow.view-model';
import { SprayingSessionMapComponent } from '../spraying-session-map/spraying-session-map';

@Component({
  selector: 'app-spraying-flow-detail-panel',
  imports: [
    CommonModule,
    TranslateModule,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    SprayingSessionMapComponent,
  ],
  templateUrl: './spraying-flow-detail-panel.html',
  styleUrl: './spraying-flow-detail-panel.scss',
})
export class SprayingFlowDetailPanelComponent {
  public viewModel = inject(SprayingFlowViewModel);
}
