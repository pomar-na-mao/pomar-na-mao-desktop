import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardViewModel, DashboardActivity } from '../../../view-models/dashboard/dashboard.view-model';

@Component({
  selector: 'app-dashboard-recent-activities',
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full relative">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-slate-900">Atividades Recentes</h2>
        <button class="text-blue-600 text-sm font-medium hover:underline">
          Ver tudo
        </button>
      </div>
      <div class="space-y-2 max-h-[360px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent relative">
        @for (activity of dashboardViewModel.recentActivities(); track activity) {
        <div class="cursor-pointer flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group relative">
       
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                {{ activity.plantName }}
              </p>
              <p class="text-xs font-medium text-slate-400 whitespace-nowrap ml-2">
                {{ activity.time }}
              </p>
            </div>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                {{ activity.region }}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                    [ngClass]="{
                      'bg-amber-50 text-amber-600 border-amber-100': activity.occurrences > 0,
                      'bg-emerald-50 text-emerald-600 border-emerald-100': activity.occurrences === 0
                    }">
                {{ activity.occurrences }} ocorrências
              </span>
            </div>
          </div>
          
          <button (click)="dashboardViewModel.openDetails(activity)" class="absolute bottom-2 right-2 p-1.5 text-blue-600 hover:opacity-70 transition-all" title="Ver detalhes">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
          </button>
        </div>
        }
      </div>
    </div>

    <!-- Modal de Detalhes -->
    @if (dashboardViewModel.selectedActivity()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" (click)="dashboardViewModel.closeDetails()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5" (click)="$event.stopPropagation()">
          
          <!-- Colored Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between"
               [ngClass]="{
                 'bg-emerald-500': dashboardViewModel.selectedActivity()?.type === 'success',
                 'bg-amber-500': dashboardViewModel.selectedActivity()?.type === 'warning',
                 'bg-indigo-500': dashboardViewModel.selectedActivity()?.type === 'info',
                 'bg-rose-500': dashboardViewModel.selectedActivity()?.type === 'error'
               }">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
                 @if (dashboardViewModel.selectedActivity()?.type === 'warning') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                } @else if (dashboardViewModel.selectedActivity()?.type === 'success') {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">{{ dashboardViewModel.selectedActivity()?.plantName }}</h3>
                <p class="text-white/80 text-sm font-medium">Detalhes da Planta</p>
              </div>
            </div>
            <button (click)="dashboardViewModel.closeDetails()" class="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Zona</p>
                  <p class="font-bold text-slate-800">{{ dashboardViewModel.selectedActivity()?.region }}</p>
                </div>
              </div>
              <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Atualizado</p>
                  <p class="font-bold text-slate-800 text-sm">{{ dashboardViewModel.selectedActivity()?.time }}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Ocorrências Ativas
                </h4>
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  {{ dashboardViewModel.selectedActivity()?.occurrences }}
                </span>
              </div>
              
              @if (dashboardViewModel.selectedActivity()?.activeOccurrences?.length) {
                <div class="flex flex-wrap gap-2 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                  @for (occ of dashboardViewModel.selectedActivity()?.activeOccurrences; track occ) {
                    <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold bg-white text-amber-700 border border-amber-200 shadow-sm transition-transform hover:-translate-y-0.5">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                      {{ occ }}
                    </span>
                  }
                </div>
              } @else {
                <div class="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-medium flex items-center shadow-inner">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  Excelente! Nenhuma ocorrência ativa registrada no momento.
                </div>
              }
            </div>
          </div>
          
          <div class="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
            <button (click)="dashboardViewModel.closeDetails()" class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-sm active:scale-95">
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DashboardRecentActivities {
  public dashboardViewModel = inject(DashboardViewModel);
}
