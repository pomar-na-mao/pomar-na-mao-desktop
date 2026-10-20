import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OperationsViewModel } from '../../../view-models/operations/operations.view-model';
import { OperationsMapDetailsCard } from './operations-map-details-card';

@Component({
  selector: 'app-operations-map',
  imports: [OperationsMapDetailsCard, ButtonModule],
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
        class="h-full w-full bg-slate-100 dark:bg-slate-900 dark:[filter:invert(0.9)_hue-rotate(180deg)_brightness(0.9)_contrast(1.1)] transition-[filter]"
      ></div>

      <app-operations-map-details-card />

      <p-button
        (onClick)="toggleFullscreen()"
        [icon]="operationsViewModel.isMapFullscreen() ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
        [rounded]="true"
        severity="secondary"
        styleClass="absolute right-3 top-3 z-[400]"
        [ariaLabel]="operationsViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
        [title]="operationsViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
      />
    </div>
  `,
})
export class OperationsMap implements AfterViewInit, OnDestroy {
  public operationsViewModel = inject(OperationsViewModel);

  public ngAfterViewInit(): void {
    this.operationsViewModel.initMap('operations-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  public toggleFullscreen(): void {
    const nextValue = !this.operationsViewModel.isMapFullscreen();
    this.operationsViewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    this.operationsViewModel.invalidateMapSize();
  }
}
