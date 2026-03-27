import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-button',
  imports: [TranslateModule],
  templateUrl: './app-button.html',
  host: { class: 'block' },
})
export class AppButton {
  @Input() public label = '';
  @Input() public loading = false;
  @Input() public disabled = false;
  @Input() public fullWidth = true;
  @Input() public type: 'submit' | 'button' | 'reset' = 'submit';
}
