import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { OperationsMapDetailsCard } from './operations-map-details-card';

@Component({
  selector: 'app-operations-map',
  imports: [OperationsMapDetailsCard],
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="relative h-full w-full">
      <div
        id="operations-map"
        class="h-full w-full bg-slate-100 dark:bg-slate-900"
      ></div>

      <app-operations-map-details-card />

      <button
        (click)="toggleFullscreen()"
        class="absolute right-3 top-3 z-[400] rounded-lg bg-white/90 p-2 text-slate-600 shadow-md backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 focus:outline-none dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        [title]="
          operationsViewModel.isMapFullscreen()
            ? 'Sair da tela cheia'
            : 'Tela cheia'
        "
      >
        @if (operationsViewModel.isMapFullscreen()) {
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 11v-5h5M15 13v5h-5M4 20l5-5M20 4l-5 5"
            />
          </svg>
        } @else {
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        }
      </button>
    </div>
  `,
})
export class OperationsMap implements AfterViewInit, OnDestroy {
  public operationsViewModel = inject(OperationsViewModel);
  private themeObserver: MutationObserver | null = null;

  public ngAfterViewInit(): void {
    this.operationsViewModel.initMap('operations-map');
    this.applyMapTheme();
    this.observeThemeChanges();
  }

  public ngOnDestroy(): void {
    this.themeObserver?.disconnect();
    this.themeObserver = null;
    document.body.style.overflow = '';
  }

  public toggleFullscreen(): void {
    const nextValue = !this.operationsViewModel.isMapFullscreen();
    this.operationsViewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    this.operationsViewModel.invalidateMapSize();
    queueMicrotask(() => this.applyMapTheme());
  }

  private observeThemeChanges(): void {
    this.themeObserver = new MutationObserver(() => this.applyMapTheme());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  private applyMapTheme(): void {
    const tilePane = document.querySelector<HTMLElement>(
      '#operations-map .leaflet-tile-pane',
    );
    if (!tilePane) {
      return;
    }

    const isDark = document.documentElement.classList.contains('dark');
    tilePane.style.filter = isDark
      ? 'invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(1.1)'
      : '';
  }
}
