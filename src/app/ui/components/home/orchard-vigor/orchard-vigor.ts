import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-orchard-vigor',
  imports: [CommonModule, TranslateModule],
  templateUrl: './orchard-vigor.html',
})
export class OrchardVigorComponent {
  percent = input<number>(0);

  isHealthy = computed(() => this.percent() >= 70);
}
