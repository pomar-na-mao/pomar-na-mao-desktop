import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (isMobileOpen) {
      <button
        type="button"
        class="fixed inset-x-0 bottom-0 top-14 z-[1190] bg-black/35 backdrop-blur-[2px] md:hidden"
        aria-label="Fechar navegação"
        (click)="navigationSelected.emit()"
      ></button>
    }
    <aside
      id="app-navigation"
      class="fixed bottom-0 left-0 top-14 z-[1200] w-56 -translate-x-full bg-surface shadow-ui-md transition-[width,transform] duration-[180ms] ease-ui md:z-20 md:translate-x-0"
      [ngClass]="{
        'translate-x-0': isMobileOpen,
        'md:w-16': isCollapsed,
        'md:w-56': !isCollapsed
      }"
    >
      <nav class="space-y-1 p-2.5" aria-label="Navegação principal">
        @for (item of menuItems; track item) {
          <div>
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-primary-soft text-primary-strong"
              [routerLinkActiveOptions]="{ exact: true }"
              class="group relative flex h-10 items-center overflow-hidden rounded-ui-md text-ink-muted transition-[background-color,color] duration-120 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              [ngClass]="
                isCollapsed ? 'md:justify-center md:px-0 md:gap-0 px-3 gap-3' : 'px-3 gap-3'
              "
              [title]="isCollapsed ? item.label : ''"
              (click)="navigationSelected.emit()"
            >
              <!-- Active Indicator (Only visible when expanded) -->
              @if (!isCollapsed) {
                <div
                  routerLinkActive="scale-y-100 opacity-100"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="absolute bottom-1 left-0 top-1 w-1 scale-y-0 rounded-full bg-primary opacity-0 transition-[transform,opacity] duration-[180ms]"
                ></div>
              }
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 flex-shrink-0 transition-colors group-hover:text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="item.icon"
                />
              </svg>
              <span
                class="whitespace-nowrap text-body font-medium transition-[width,opacity] duration-[180ms]"
                [ngClass]="isCollapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'"
              >
                {{ item.label }}
              </span>
            </a>
          </div>
        }
      </nav>
    </aside>
  `,
})
export class Sidebar {
  @Input() isCollapsed = false;
  @Input() isMobileOpen = false;
  @Output() navigationSelected = new EventEmitter<void>();

  public menuItems: MenuItem[] = [
    {
      label: 'Pomar',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/pomar',
    },
    {
      label: 'Operações',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      path: '/operacoes',
    },
    {
      label: 'Mipd',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
      path: '/mipd',
    },
    {
      label: 'Inclusões em Massa',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      path: '/inclusoes-em-massa',
    },
    {
      label: 'Zonas',
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      path: '/zonas',
    },
    {
      label: 'Configurações',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      path: '/configuracoes',
    },
    {
      label: 'Usuários',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/usuarios',
    },
  ];
}
