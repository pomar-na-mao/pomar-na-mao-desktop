import { Component, inject } from '@angular/core';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';

@Component({
  selector: 'app-dashboard-metrics',
  template: `
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    @for (metric of dashboardViewModel.metrics(); track metric) {
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-3">
        <div class="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="metric.icon" />
          </svg>
        </div>
        @if (metric.change) {
        <span class="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">
          {{ metric.change }}
        </span>
        }
      </div>
      <div>
        <p class="text-sm font-medium text-slate-500 uppercase tracking-wider">
          {{ metric.label }}
        </p>
        <h3 class="text-xl font-bold text-slate-900 mt-1">
          {{ metric.value }}
        </h3>
      </div>
    </div>
    }
  </div>
  `
})
export class DashboardMetrics {
  public dashboardViewModel = inject(DashboardViewModel);
}
