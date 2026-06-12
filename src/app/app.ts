import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loading } from './shared/components/loading/loading';
import { LoadingService } from './shared/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <router-outlet />
    @if (loadingService.isLoading()) {
      <app-loading [message]="loadingService.message()" />
    }
  `,
})
export class App {
  loadingService = inject(LoadingService);
}
