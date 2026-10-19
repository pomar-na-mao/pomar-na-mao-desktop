import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../../data/services/message/message.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (messageService.showMessage() && messageService.currentMessage(); as message) {
      <aside
        class="fixed left-4 right-4 top-16 z-[2000] max-w-md shadow-xl backdrop-blur-md sm:left-auto sm:right-6 p-3.5 rounded-xl border flex items-start justify-between gap-3 text-sm font-medium animate-fadein transition-all"
        [ngClass]="containerClasses(message.type)"
        role="status"
        aria-live="polite"
      >
        <div class="flex items-start gap-2.5 min-w-0">
          <i [class]="iconClasses(message.type)" class="mt-0.5 text-base shrink-0"></i>
          <span class="break-words leading-snug">{{ message.text }}</span>
        </div>
        <button
          type="button"
          (click)="messageService.hide()"
          class="shrink-0 p-1 -mr-1 -mt-0.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity focus:outline-none cursor-pointer"
          aria-label="Fechar"
        >
          <i class="pi pi-times text-xs"></i>
        </button>
      </aside>
    }
  `,
})
export class AppToast {
  public messageService = inject(MessageService);

  public containerClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100';
      case 'error':
        return 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100';
      case 'warn':
        return 'bg-amber-50 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-950/90 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-100';
    }
  }

  public iconClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'pi pi-check-circle text-emerald-600 dark:text-emerald-400';
      case 'error':
        return 'pi pi-times-circle text-rose-600 dark:text-rose-400';
      case 'warn':
        return 'pi pi-exclamation-triangle text-amber-600 dark:text-amber-400';
      case 'info':
      default:
        return 'pi pi-info-circle text-blue-600 dark:text-blue-400';
    }
  }
}
