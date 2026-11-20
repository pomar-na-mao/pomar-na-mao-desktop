import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { HarvestForecastViewModel } from '../../../view-models/harvest-forecast/harvest-forecast.view-model';

@Component({
  selector: 'app-harvest-forecast-map',
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [':host { display: block; height: 100%; width: 100%; }'],
  template: `
    <div class="relative h-full w-full">
      <div
        id="harvest-forecast-map"
        class="h-full w-full bg-slate-100 dark:bg-slate-900"
      ></div>

      <div
        class="ui-surface-raised absolute bottom-3 left-3 z-[400] rounded-xl border border-surface-200 bg-white/95 p-2.5 shadow-md dark:border-surface-700 dark:bg-surface-900/95"
        aria-label="Legenda das classificações"
      >
        <p
          class="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-surface-700 dark:text-surface-200"
        >
          Classificação
        </p>
        <div class="grid grid-cols-5 gap-2">
          @for (
            classification of viewModel.classifications;
            track classification
          ) {
            <div
              class="flex flex-col items-center gap-0.5 text-[9px] text-surface-700 dark:text-surface-200"
              [attr.title]="viewModel.classificationLabels[classification]"
            >
              <span
                class="h-3 w-3 rounded-full border border-surface-900/30"
                [style.backgroundColor]="
                  viewModel.classificationColors[classification]
                "
              ></span>
              <span>{{ classification }}</span>
              <span class="sr-only">{{
                viewModel.classificationLabels[classification]
              }}</span>
            </div>
          }
        </div>
      </div>

      @if (viewModel.isLoading()) {
        <div
          class="absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-lg bg-surface-900/85 px-3 py-2 text-xs text-white"
          role="status"
        >
          Carregando previsões…
        </div>
      } @else if (viewModel.loadError()) {
        <div
          class="absolute left-1/2 top-3 z-[400] flex -translate-x-1/2 items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-800 shadow dark:border-red-800 dark:bg-red-950 dark:text-red-100"
          role="alert"
        >
          <span>Não foi possível carregar as previsões.</span>
          <button
            type="button"
            class="cursor-pointer rounded underline focus:outline-none focus:ring-2 focus:ring-red-500"
            (click)="viewModel.retry()"
          >
            Tentar novamente
          </button>
        </div>
      } @else if (viewModel.showEmptyState()) {
        <div
          class="absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-lg bg-surface-900/85 px-3 py-2 text-xs text-white"
          role="status"
        >
          Nenhuma planta encontrada para os filtros.
        </div>
      } @else if (!viewModel.hasFilterInteraction()) {
        <div
          class="absolute left-1/2 top-3 z-[400] -translate-x-1/2 rounded-lg bg-surface-900/85 px-3 py-2 text-xs text-white"
          role="status"
        >
          Use os filtros para visualizar as plantas.
        </div>
      }

      <p-button
        (onClick)="toggleFullscreen()"
        [icon]="
          viewModel.isMapFullscreen()
            ? 'pi pi-window-minimize'
            : 'pi pi-window-maximize'
        "
        [rounded]="true"
        severity="secondary"
        styleClass="absolute right-3 top-3 z-[400]"
        [ariaLabel]="
          viewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'
        "
        [title]="
          viewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'
        "
      />
    </div>
  `,
})
export class HarvestForecastMap implements AfterViewInit, OnDestroy {
  public viewModel = inject(HarvestForecastViewModel);

  public ngAfterViewInit(): void {
    this.viewModel.initMap('harvest-forecast-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.classList.remove('map-fullscreen-active');
    this.viewModel.destroyMap();
  }

  public toggleFullscreen(): void {
    const fullscreen = !this.viewModel.isMapFullscreen();
    this.viewModel.setMapFullscreen(fullscreen);
    document.body.style.overflow = fullscreen ? 'hidden' : '';
    document.body.classList.toggle('map-fullscreen-active', fullscreen);
    this.viewModel.invalidateMapSize();
  }
}
