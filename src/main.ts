import {
  enableProdMode,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { IMAGE_CONFIG } from '@angular/common';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXhr,
} from '@angular/common/http';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
} from '@angular/router';
import Lara from '@primeuix/themes/lara';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { APP_CONFIG } from './environments/environment';
import { App } from './app/app';
import { ROUTES } from './app/app.routes';
import { ptBrTranslation } from './app/utils/pt-br';

if (APP_CONFIG.production) {
  enableProdMode();
}

bootstrapApplication(App, {
  providers: [
    MessageService,
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideRouter(
      ROUTES,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
    ),
    providePrimeNG({
      translation: ptBrTranslation,
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
}).catch((err) => console.error(err));
