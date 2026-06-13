import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900/30 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-500 animate-in fade-in">
      <div class="relative flex items-center justify-center w-28 h-28 mb-6 drop-shadow-2xl">
        <!-- Spinner rings -->
        <div class="absolute inset-0 rounded-full border-4 border-white/20"></div>
        <div class="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        <!-- Logo -->
        <img src="assets/images/logo.png" alt="Loading" class="w-14 h-14 object-contain animate-pulse" />
      </div>
      @if (message) {
        <h3 class="text-xl font-bold text-white tracking-tight animate-pulse drop-shadow-md">{{ message }}</h3>
      }
    </div>
  `,
})
export class Loading {
  @Input() message?: string;
}
