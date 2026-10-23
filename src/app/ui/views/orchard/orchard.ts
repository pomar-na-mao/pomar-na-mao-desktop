import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orchard',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="w-full h-full">
      <router-outlet />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Orchard {}
