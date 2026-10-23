import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MipdViewModel } from '../../../view-models/mipd/mipd.view-model';
import { MipdMapDetailsCard } from './mipd-map-details-card';

@Component({
  selector: 'app-mipd-map',
  imports: [ButtonModule, MipdMapDetailsCard],
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
        id="mipd-map"
        class="h-full w-full bg-slate-100 dark:bg-slate-900 dark:[filter:invert(0.9)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)] transition-[filter]"
      ></div>

      @if (mipdViewModel.isLoading()) {
        <div
          class="absolute left-3 top-3 z-[400] inline-flex items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0/95 dark:bg-surface-900/95 px-3 py-2 text-xs font-medium text-surface-700 dark:text-surface-200 shadow-ui-sm"
          role="status"
          aria-live="polite"
        >
          <i class="pi pi-spinner pi-spin text-primary" aria-hidden="true"></i>
          Carregando marcações...
        </div>
      } @else if (mipdViewModel.errorMessage()) {
        <div
          class="absolute left-3 top-3 z-[400] max-w-sm rounded-xl border border-red-200 dark:border-red-800 bg-red-50/95 dark:bg-red-950/90 px-3 py-2 text-xs font-medium text-red-700 dark:text-red-200 shadow-ui-sm"
          role="alert"
        >
          <i class="pi pi-exclamation-triangle mr-1.5" aria-hidden="true"></i>
          Não foi possível carregar as marcações. Ajuste os filtros ou tente novamente.
        </div>
      } @else if (mipdViewModel.showEmptyState()) {
        <div
          class="absolute left-3 top-3 z-[400] max-w-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0/95 dark:bg-surface-900/95 px-3 py-2 text-xs font-medium text-surface-600 dark:text-surface-300 shadow-ui-sm"
          role="status"
        >
          <i class="pi pi-info-circle mr-1.5 text-surface-400" aria-hidden="true"></i>
          Nenhum registro encontrado para os filtros selecionados.
        </div>
      } @else if (!mipdViewModel.hasActiveFilters()) {
        <div
          class="absolute left-3 top-3 z-[400] max-w-sm rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0/95 dark:bg-surface-900/95 px-3 py-2 text-xs font-medium text-surface-600 dark:text-surface-300 shadow-ui-sm"
          role="status"
        >
          Selecione o período e uma praga ou doença para visualizar as plantas.
        </div>
      }

      <app-mipd-map-details-card />

      <p-button
        (onClick)="toggleFullscreen()"
        [icon]="mipdViewModel.isMapFullscreen() ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
        [rounded]="true"
        severity="secondary"
        styleClass="absolute right-3 top-3 z-[400]"
        [ariaLabel]="mipdViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
        [title]="mipdViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
      />
    </div>
  `,
})
export class MipdMap implements AfterViewInit, OnDestroy {
  public mipdViewModel = inject(MipdViewModel);

  public ngAfterViewInit(): void {
    this.mipdViewModel.initMap('mipd-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.mipdViewModel.destroyMap();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.mipdViewModel.isMapFullscreen();
    this.mipdViewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    this.mipdViewModel.invalidateMapSize();
  }
}

