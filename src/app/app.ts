import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TauriService } from './core/services';
import { RouterOutlet } from '@angular/router';
import { AppToast } from './shared/components';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet />
    <app-toast />
  `,
  imports: [RouterOutlet, AppToast]
})
export class AppComponent {
  private readonly tauriService = inject(TauriService);
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.setFallbackLang('pt');

    if (this.tauriService.isTauri) {
      console.log('Run in Tauri');
      this.tauriService.callHelloWorld();
    } else {
      console.log('Run in browser');
    }
  }
}
