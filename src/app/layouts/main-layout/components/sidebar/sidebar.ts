import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  template: `
    <aside
      class="fixed top-[60px] left-0 h-[calc(100vh-60px)] bg-white border-r border-slate-200 transition-all duration-300 ease-in-out z-20 shadow-sm"
      [ngClass]="isCollapsed ? 'w-[64px]' : 'w-[240px]'"
    >
      <nav class="p-3 space-y-1">
        @for (item of menuItems; track item) {
          <div>
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-emerald-50 text-emerald-600"
              [routerLinkActiveOptions]="{ exact: true }"
              class="relative flex items-center h-12 rounded-xl transition-all group hover:bg-slate-50 overflow-hidden"
              [ngClass]="isCollapsed ? 'justify-center px-0 gap-0' : 'px-4 gap-3'"
              [title]="isCollapsed ? item.label : ''"
            >
              <!-- Active Indicator (Only visible when expanded) -->
              @if (!isCollapsed) {
                <div
                  routerLinkActive="scale-y-100 opacity-100"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="absolute left-0 top-3 bottom-3 w-1 bg-emerald-600 rounded-r-full scale-y-0 opacity-0 transition-all duration-300"
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
  @Input() menuItems: any[] = [];
}
