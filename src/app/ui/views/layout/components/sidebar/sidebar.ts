import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
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
    <aside
      class="fixed top-[60px] left-0 h-[calc(100vh-60px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out z-20 shadow-sm"
      [ngClass]="isCollapsed ? 'w-[64px]' : 'w-[240px]'"
    >
      <nav class="p-3 space-y-1">
        @for (item of menuItems; track item) {
          <div>
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              [routerLinkActiveOptions]="{ exact: true }"
              class="relative flex items-center h-12 rounded-xl transition-all group hover:bg-slate-50 dark:hover:bg-slate-800 overflow-hidden text-slate-700 dark:text-slate-300"
              [ngClass]="
                isCollapsed ? 'justify-center px-0 gap-0' : 'px-4 gap-3'
              "
              [title]="isCollapsed ? item.label : ''"
            >
              <!-- Active Indicator (Only visible when expanded) -->
              @if (!isCollapsed) {
                <div
                  routerLinkActive="scale-y-100 opacity-100"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="absolute left-0 top-0 bottom-0 w-2 bg-emerald-600  scale-y-0 opacity-0 transition-all duration-300"
                ></div>
              }
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6 flex-shrink-0 transition-colors group-hover:text-emerald-500"
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
                class="font-medium transition-all duration-300 whitespace-nowrap"
                [ngClass]="isCollapsed ? 'opacity-0 w-0' : 'opacity-100'"
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

  public menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/home',
    },
    {
      label: 'Inclusões em Massa',
      icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
      path: '/inclusoes-em-massa',
    },
    {
      label: 'Configurações',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      path: '/settings',
    },
    {
      label: 'Usuários',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/users',
    },
  ];
}
