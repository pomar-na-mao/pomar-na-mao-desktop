import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationRepository } from '../../../../data/repositories/authentication/authentication-repository';

export interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './app-sidebar.html',
  styleUrls: ['./app-sidebar.scss'],
})
export class AppSidebar {
  private authRepository = inject(AuthenticationRepository);
  private router = inject(Router);

  public navItems: NavItem[] = [
    { icon: 'dashboard', label: 'LAYOUT.SIDEBAR.MENU.DASHBOARD', route: '/pomar-na-mao/home' },
    { icon: 'sync', label: 'LAYOUT.SIDEBAR.MENU.SYNCS', route: '/pomar-na-mao/sincronizacoes' },
  ];

  async logout(): Promise<void> {
    const { error } = await this.authRepository.signOut();
    if (!error) {
      this.router.navigate(['/login']);
    }
  }
}
