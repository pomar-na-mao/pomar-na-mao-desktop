import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface MenuItem {
  label: string;
  icon: string;
  path?: string;
  items?: MenuItem[];
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
            @if (item.items?.length) {
              <button
                type="button"
                class="group relative flex h-10 w-full items-center overflow-hidden rounded-ui-md text-ink-muted transition-[background-color,color] duration-120 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                [ngClass]="
                  isCollapsed ? 'md:justify-center md:px-0 md:gap-0 px-3 gap-3' : 'px-3 gap-3'
                "
                [title]="isCollapsed ? item.label : ''"
                [attr.aria-expanded]="isMenuExpanded(item.label)"
                [attr.aria-controls]="'submenu-' + item.label.toLowerCase()"
                (click)="toggleMenu(item.label)"
              >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-[180ms]"
                  [class.rotate-90]="isMenuExpanded(item.label)"
                  [class.md:hidden]="isCollapsed"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              @if (isMenuExpanded(item.label) && !isCollapsed) {
                <div
                  [id]="'submenu-' + item.label.toLowerCase()"
                  class="mt-1 space-y-1 pl-4"
                  role="group"
                >
                  @for (child of item.items; track child) {
                    <a
                      [routerLink]="child.path"
                      routerLinkActive="bg-primary-soft text-primary-strong"
                      [routerLinkActiveOptions]="{ exact: true }"
                      class="group relative flex h-10 items-center gap-3 overflow-hidden rounded-ui-md px-3 text-ink-muted transition-[background-color,color] duration-120 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                      (click)="navigationSelected.emit()"
                    >
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
                          [attr.d]="child.icon"
                        />
                      </svg>
                      <span class="whitespace-nowrap text-body font-medium">
                        {{ child.label }}
                      </span>
                    </a>
                  }
                </div>
              }
            } @else {
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
            }
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

  private readonly expandedMenus = new Set<string>();

  public menuItems: MenuItem[] = [
    {
      label: 'Visão geral',
      icon: 'M3 3v18h18M7 15l4-4 3 3 5-6',
      path: '/visao-geral',
    },
    {
      label: 'Cadastro',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/cadastro',
    },
    {
      label: 'Registrar',
      icon: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
      items: [
        {
          label: 'Ocorrências',
          icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
          path: '/registrar/ocorrencias',
        },
      ],
    },
    {
      label: 'Atividades de campo',
      icon: 'M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V4H6.5A2.5 2.5 0 004 6.5v13z',
      path: '/atividades-de-campo',
    },
    /* {
      label: 'Configurações',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      path: '/configuracoes',
    },
    {
      label: 'Usuários',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/usuarios',
    }, */
  ];

  public isMenuExpanded(label: string): boolean {
    return this.expandedMenus.has(label);
  }

  public toggleMenu(label: string): void {
    if (this.expandedMenus.has(label)) {
      this.expandedMenus.delete(label);
      return;
    }

    this.expandedMenus.add(label);
  }
}
