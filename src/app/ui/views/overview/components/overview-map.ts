import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OverviewViewModel } from '../../../view-models/overview/overview.view-model';
import { OverviewMapDetailsCard } from './overview-map-details-card';

@Component({
  selector: 'app-overview-map',
  imports: [ButtonModule, OverviewMapDetailsCard],
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
        id="overview-map"
        class="h-full w-full bg-slate-100 dark:bg-slate-900 dark:[filter:invert(0.9)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)] transition-[filter]"
      ></div>

      <!-- Floating Plant Inspection Details Card -->
      <app-overview-map-details-card />

      <!-- Fullscreen button floating over map -->
      <p-button
        (onClick)="toggleFullscreen()"
        [icon]="overviewViewModel.isMapFullscreen() ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
        [rounded]="true"
        severity="secondary"
        styleClass="absolute right-3 top-3 z-[400]"
        [ariaLabel]="overviewViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
        [title]="overviewViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
      />
    </div>
  `,
})
export class OverviewMap implements AfterViewInit, OnDestroy {
  public overviewViewModel = inject(OverviewViewModel);

  public ngAfterViewInit(): void {
    this.overviewViewModel.initMap('overview-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.classList.remove('map-fullscreen-active');
    this.overviewViewModel.destroyMap();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.overviewViewModel.isMapFullscreen();
    this.overviewViewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    document.body.classList.toggle('map-fullscreen-active', nextValue);
    this.overviewViewModel.invalidateMapSize();
  }
}
