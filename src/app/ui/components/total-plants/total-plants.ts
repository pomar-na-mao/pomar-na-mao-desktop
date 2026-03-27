import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-total-plants',
  imports: [CommonModule, TranslateModule, TimeAgoPipe],
  templateUrl: './total-plants.html',
})
export class TotalPlantsComponent {
  total = input<number>(0);
  latestUpdatedAt = input<string | null>(null);
}
