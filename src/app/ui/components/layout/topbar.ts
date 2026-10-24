import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { LayoutService } from '../../../data/services/shared/layout';

@Component({
  selector: 'app-topbar',
  imports: [RouterModule, CommonModule, StyleClassModule, TooltipModule, AvatarModule],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo" routerLink="/visao-geral">
        <img alt="Logo" src="assets/images/logo.png" />
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          [pTooltip]="layoutService.isDarkTheme() ? 'Tema claro' : 'Tema escuro'"
          tooltipPosition="left"
          type="button"
          class="layout-topbar-action"
          (click)="toggleDarkMode()">
          <i
            [ngClass]="{
              'pi ': true,
              'pi-moon': layoutService.isDarkTheme(),
              'pi-sun': !layoutService.isDarkTheme(),
            }"></i>
        </button>
        <p-avatar
          class="inline-block lg:hidden"
          [size]="'large'"
          [image]="usersRepository.currentUser()?.avatar_url"
          shape="circle"
          data-pc-name="avatar"
          class="ring-2 ring-primary-500 shadow-lg shadow-primary p-avatar p-component p-avatar-circle p-avatar-image">
        </p-avatar>
      </div>

      <button
        class="layout-topbar-menu-button layout-topbar-action"
        pStyleClass="@next"
        enterFromClass="hidden"
        enterActiveClass="animate-scalein"
        leaveToClass="hidden"
        leaveActiveClass="animate-fadeout"
        [hideOnOutsideClick]="true">
        <i class="pi pi-ellipsis-v"></i>
      </button>

      <div class="layout-topbar-menu hidden lg:block">
        <div class="layout-topbar-menu-content">
          <button
            pTooltip="Sair"
            tooltipPosition="bottom"
            (click)="signOutUserHandler()"
            type="button"
            class="layout-topbar-action">
            <i class="pi pi-sign-out"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  </div>`,
})
export class AppTopbar {
  public items!: MenuItem[];

  public layoutService = inject(LayoutService);

  public authenticationRepository = inject(AuthenticationRepository);

  public usersRepository = inject(UsersRepository);

  private router = inject(Router);

  public toggleDarkMode(): void {
    this.layoutService.layoutConfig.update(state => ({ ...state, darkTheme: !state.darkTheme }));
  }

  public async signOutUserHandler(): Promise<void> {
    this.router.navigate(['/login']);
    await this.authenticationRepository.signOut();
  }
}
