import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MyOrchardViewModel } from '../../../view-models/my-orchard/my-orchard.view-model';
import { MyOrchardMapDetailsCard } from './my-orchard-map-details-card';

@Component({
  selector: 'app-my-orchard-map',
  imports: [ButtonModule, MyOrchardMapDetailsCard],
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
        id="my-orchard-map"
        class="h-full w-full bg-slate-100 dark:bg-slate-900"
      ></div>

      <!-- Floating Plant Inspection Details Card -->
      <app-my-orchard-map-details-card />

      <!-- Fullscreen button floating over map -->
      <p-button
        (onClick)="toggleFullscreen()"
        [icon]="myOrchardViewModel.isMapFullscreen() ? 'pi pi-window-minimize' : 'pi pi-window-maximize'"
        [rounded]="true"
        severity="secondary"
        styleClass="absolute right-3 top-3 z-[400]"
        [ariaLabel]="myOrchardViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
        [title]="myOrchardViewModel.isMapFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'"
      />
    </div>
  `,
})
export class MyOrchardMap implements AfterViewInit, OnDestroy {
  public myOrchardViewModel = inject(MyOrchardViewModel);

  public ngAfterViewInit(): void {
    this.myOrchardViewModel.initMap('my-orchard-map');
  }

  public ngOnDestroy(): void {
    document.body.style.overflow = '';
    document.body.classList.remove('map-fullscreen-active');
    this.myOrchardViewModel.destroyMap();
  }

  public toggleFullscreen(): void {
    const nextValue = !this.myOrchardViewModel.isMapFullscreen();
    this.myOrchardViewModel.setMapFullscreen(nextValue);
    document.body.style.overflow = nextValue ? 'hidden' : '';
    document.body.classList.toggle('map-fullscreen-active', nextValue);
    this.myOrchardViewModel.invalidateMapSize();
  }
}
