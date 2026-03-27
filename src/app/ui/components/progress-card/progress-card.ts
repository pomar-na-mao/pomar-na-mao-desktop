import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-progress-card',
  imports: [CommonModule, TranslateModule],
  templateUrl: './progress-card.html',
})
export class ProgressCardComponent {
  percent = input<number>(0);
}
