import { Component, inject } from '@angular/core';
import { DashboardViewModel } from '../../../view-models/dashboard/dashboard.view-model';

@Component({
  selector: 'app-dashboard-header',
  template: `
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-slate-500 mt-1">
        Bem-vindo de volta! Aqui está o resumo do seu pomar.
      </p>
    </div>
    <button
      (click)="dashboardViewModel.refreshData()"
      class="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </button>
  </div>
  `
})
export class DashboardHeader {
  public dashboardViewModel = inject(DashboardViewModel);
}
