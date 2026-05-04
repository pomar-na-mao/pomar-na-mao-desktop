import { Component, inject } from '@angular/core';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';

@Component({
  selector: 'app-dashboard-metrics',
  template: `
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full auto-rows-fr">
    @for (metric of dashboardViewModel.metrics(); track metric) {
    <div class="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all flex flex-col justify-center">
      <div class="flex items-center justify-between mb-3">
        <div class="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="metric.icon" />
          </svg>
        </div>
        @if (metric.change) {
        <span class="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {{ metric.change }}
        </span>
        }
      </div>
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wider transition-colors">
          {{ metric.label }}
        </p>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1 transition-colors">
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
