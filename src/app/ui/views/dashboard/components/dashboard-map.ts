import { Component, inject, AfterViewInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { Select } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-dashboard-map',
  imports: [Select, FormsModule],
  template: `
    <div [class]="isFullscreen() ? 'fixed inset-0 z-[100] bg-white dark:bg-slate-900 p-6 flex flex-col w-screen h-screen transition-colors' : 'bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full transition-colors'">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white transition-colors">Meu pomar</h2>
        <button (click)="toggleFullscreen()" class="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none" [title]="isFullscreen() ? 'Sair da tela cheia' : 'Tela cheia'">
          @if (isFullscreen()) {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11v-5h5M15 13v5h-5M4 20l5-5M20 4l-5 5" /></svg>
          } @else {
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          }
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <app-select
          [options]="dashboardViewModel.regionOptions()"
          [ngModel]="dashboardViewModel.selectedRegion()"
          (ngModelChange)="dashboardViewModel.onRegionChange($event)"
          label="Zona"
          class="w-full"
        ></app-select>
        
        <app-select
          [options]="dashboardViewModel.occurrenceOptions()"
          [ngModel]="dashboardViewModel.selectedOccurrence()"
          (ngModelChange)="dashboardViewModel.onOccurrenceChange($event)"
          [disabled]="!dashboardViewModel.selectedRegion()"
          label="Ocorrência"
          class="w-full"
        ></app-select>
        
        <app-select
          [options]="dashboardViewModel.varietyOptions()"
          [ngModel]="dashboardViewModel.selectedVariety()"
          (ngModelChange)="dashboardViewModel.onVarietyChange($event)"
          [disabled]="!dashboardViewModel.selectedRegion()"
          label="Variedade"
          class="w-full"
        ></app-select>
      </div>

      <!-- Map Container -->
      <div id="dashboard-map" class="w-full flex-1 min-h-[300px] rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 z-0 relative transition-all dark:invert dark:hue-rotate-180 dark:brightness-95">
        <!-- Leaflet map will be rendered here -->
      </div>
    </div>
  `
})
export class DashboardMap implements AfterViewInit {
  public dashboardViewModel = inject(DashboardViewModel);
  public isFullscreen = signal(false);

  ngAfterViewInit() {
    this.dashboardViewModel.initMap('dashboard-map');
  }

  toggleFullscreen() {
    this.isFullscreen.update(v => !v);
    this.dashboardViewModel.invalidateMapSize();
  }
}
