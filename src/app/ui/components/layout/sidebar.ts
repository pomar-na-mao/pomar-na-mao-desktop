import { Component, inject } from '@angular/core';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';
import { AppMenu } from './menu';
import { TenantSwitcher } from './tenant-switcher';

@Component({
  selector: 'app-sidebar',
  imports: [AppMenu, TenantSwitcher],
  template: `
    <div class="layout-sidebar flex flex-col overflow-hidden">
      <div class="layout-menu-scroll mb-4 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <app-menu />
      </div>
      @if (userRolesRepository.isUserAdmin()) {
        <app-tenant-switcher
          class="shrink-0 border-t border-surface-200 pt-3 dark:border-surface-700"
        />
      }
    </div>
  `,
})
export class AppSidebar {
  public readonly userRolesRepository = inject(UserRolesRepository);
}
