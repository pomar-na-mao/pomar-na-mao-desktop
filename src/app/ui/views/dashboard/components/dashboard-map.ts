import { Component, inject, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';
import { Select } from '../../../../shared/components/select/select';

@Component({
  selector: 'app-dashboard-map',
  imports: [Select, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-slate-900">Mapa do Pomar</h2>
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
          label="Ocorrência"
          class="w-full"
        ></app-select>
        
        <app-select
          [options]="dashboardViewModel.varietyOptions()"
          [ngModel]="dashboardViewModel.selectedVariety()"
          (ngModelChange)="dashboardViewModel.onVarietyChange($event)"
          label="Variedade"
          class="w-full"
        ></app-select>
      </div>

      <!-- Map Container -->
      <div id="dashboard-map" class="w-full flex-1 min-h-[300px] rounded-xl bg-slate-100 border border-slate-200 z-0 relative">
        <!-- Leaflet map will be rendered here -->
      </div>
    </div>
  `
})
export class DashboardMap implements AfterViewInit {
  public dashboardViewModel = inject(DashboardViewModel);

  ngAfterViewInit() {
    this.dashboardViewModel.initMap('dashboard-map');
  }
}
