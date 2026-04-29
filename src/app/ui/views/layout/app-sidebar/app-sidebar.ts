import { CommonModule } from '@angular/common';
import { Component, HostBinding, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationRepository } from '../../../../data/repositories/authentication/authentication-repository';
import { UserRolesRepository } from '../../../../data/repositories/user-roles/user-roles-repository';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
  show: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './app-sidebar.html',
  styleUrls: ['./app-sidebar.scss'],
})
export class AppSidebar {
  private authRepository = inject(AuthenticationRepository);
  private userRolesRepository = inject(UserRolesRepository);
  private router = inject(Router);

  public isCollapsed = false;

  @HostBinding('class.sidebar-collapsed')
  get sidebarCollapsed(): boolean {
    return this.isCollapsed;
  }

  public navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      {
        icon: 'dashboard',
        label: 'LAYOUT.SIDEBAR.MENU.DASHBOARD',
        route: '/pomar-na-mao/home',
        show: true,
      },
      {
        icon: 'sync',
        label: 'LAYOUT.SIDEBAR.MENU.SYNCS',
        route: '/pomar-na-mao/sincronizacoes',
        show: true,
      },
      {
        icon: 'add_circle',
        label: 'LAYOUT.SIDEBAR.MENU.MASS_INCLUSION',
        route: '/pomar-na-mao/inclusoes-em-massa',
        show: true,
      },
      {
        icon: 'route',
        label: 'LAYOUT.SIDEBAR.MENU.SPRAYING_FLOW',
        route: '/pomar-na-mao/fluxo-pulverizacao',
        show: true,
      },
      {
        icon: 'admin_panel_settings',
        label: 'LAYOUT.SIDEBAR.MENU.ADMINISTRATION',
        route: '/pomar-na-mao/administracao',
        show: this.userRolesRepository.isUserAdmin(),
      },
    ];

    return items;
  });

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  async logout(): Promise<void> {
    const { error } = await this.authRepository.signOut();
    if (!error) {
      this.router.navigate(['/login']);
    }
  }
}
