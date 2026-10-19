import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LayoutService } from './data/services/shared/layout';
import { Loading } from './shared/components/loading/loading';
import { LoadingService } from './shared/services/loading.service';
import { AppToast } from './shared/components/toast/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loading, ToastModule, AppToast],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <app-toast />
    <p-toast class="hidden md:block" position="top-right" />
    <p-toast class="md:hidden block" position="top-center" />
    <router-outlet />
    @if (loadingService.isLoading()) {
      <app-loading [message]="loadingService.message()" />
    }
  `,
})
export class App implements OnInit {
  public layoutService = inject(LayoutService);
  public loadingService = inject(LoadingService);
  private platformId = inject(PLATFORM_ID);

  public ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.layoutService.startAppConfig();
      this.layoutService.setInitialStorageTheme();
    }
  }
}
