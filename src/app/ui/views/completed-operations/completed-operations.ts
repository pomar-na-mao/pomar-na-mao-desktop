import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-completed-operations',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <main class="flex min-h-[calc(100vh-8rem)] items-center justify-center p-6">
      <p class="text-lg font-medium text-surface-600 dark:text-surface-300">
        Em desenvolvimento
      </p>
    </main>
  `,
})
export class CompletedOperations {}
