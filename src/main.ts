import { enableProdMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import { APP_CONFIG } from './environments/environment';
import { App } from './app/app';
import { ROUTES } from './app/app.routes';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(App, {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(
      ROUTES,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation()
    ),
  ]
}).catch(err => console.error(err));
