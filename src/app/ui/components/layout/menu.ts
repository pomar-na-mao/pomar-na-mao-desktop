import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';
import { AppMenuitem } from './menuitem';

@Component({
  selector: 'app-menu',
  imports: [AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    @for (item of menuItems; track item; let i = $index) {
      @if (!item.separator) {
        <li app-menuitem [item]="item" [index]="i" [root]="true"></li>
      }
      @if (item.separator) {
        <li class="menu-separator"></li>
      }
    }
  </ul>`,
})
export class AppMenu implements OnInit {
  public menuItems: MenuItem[] = [];

  public userRolesRepository = inject(UserRolesRepository);

  public authenticationRepository = inject(AuthenticationRepository);

  public ngOnInit(): void {
    this.menuItems = [
      {
        label: 'Menu',
        visible: true,
        items: [
          {
            label: 'Pomar',
            visible: true,
            icon: 'pi pi-fw pi-warehouse',
            routerLink: ['/pomar'],
          },
          {
            label: 'Operações',
            visible: true,
            icon: 'pi pi-fw pi-briefcase',
            routerLink: ['/operacoes'],
          },
          {
            label: 'Inclusões em Massa',
            visible: true,
            icon: 'pi pi-fw pi-file-arrow-up',
            routerLink: ['/inclusoes-em-massa'],
          },
          {
            label: 'Zonas',
            visible: true,
            icon: 'pi pi-fw pi-map',
            items: [
              {
                label: 'Cadastro de Zonas',
                visible: true,
                icon: 'pi pi-fw pi-map-marker',
                routerLink: ['/zonas/cadastro'],
              },
              {
                label: 'Atribuição de Zonas',
                visible: true,
                icon: 'pi pi-fw pi-user-plus',
                routerLink: ['/zonas/atribuicao'],
              },
            ],
          },
          {
            label: 'Configurações',
            visible: true,
            icon: 'pi pi-fw pi-cog',
            routerLink: ['/configuracoes'],
          },
          {
            label: 'Usuários',
            visible: true,
            icon: 'pi pi-fw pi-users',
            routerLink: ['/usuarios'],
          },
        ],
      },
    ];
  }
}
