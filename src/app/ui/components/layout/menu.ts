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
            label: 'Visão geral',
            visible: true,
            icon: 'pi pi-fw pi-chart-bar',
            routerLink: ['/visao-geral'],
          },
          {
            label: 'Cadastro',
            visible: true,
            icon: 'pi pi-fw pi-file-import',
            items: [
              {
                label: 'Variedades',
                visible: true,
                icon: 'pi pi-fw pi-list',
                routerLink: ['/cadastro/variedades'],
              },
              {
                label: 'Ocorrências',
                visible: true,
                icon: 'pi pi-fw pi-exclamation-triangle',
                routerLink: ['/cadastro/ocorrencias'],
              },
              {
                label: 'Zonas',
                visible: true,
                icon: 'pi pi-fw pi-map',
                routerLink: ['/cadastro/zonas'],
              },
              {
                label: 'Infraestrutura',
                visible: true,
                icon: 'pi pi-fw pi-building',
                routerLink: ['/cadastro/infraestrutura'],
              },
              {
                label: 'Máquinas',
                visible: true,
                icon: 'pi pi-fw pi-cog',
                routerLink: ['/cadastro/maquinas'],
              },
              {
                label: 'Insumos',
                visible: true,
                icon: 'pi pi-fw pi-box',
                routerLink: ['/cadastro/insumos'],
              },
            ],
          },
          {
            label: 'Caderno de campo',
            visible: true,
            icon: 'pi pi-fw pi-book',
            items: [
              {
                label: 'Operações realizadas',
                visible: true,
                icon: 'pi pi-fw pi-check-circle',
                routerLink: ['/caderno-de-campo/operacoes-realizadas'],
              },
            ],
          },
          {
            label: 'Visão das operações',
            visible: true,
            icon: 'pi pi-fw pi-hammer',
            items: [
              {
                label: 'Operações',
                visible: true,
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/visao-das-operacoes/operacoes'],
              },
              {
                label: 'Mipd',
                visible: true,
                icon: 'pi pi-fw pi-shield',
                routerLink: ['/visao-das-operacoes/mipd'],
              },
            ],
          },
          {
            label: 'Dados básicos',
            visible: true,
            icon: 'pi pi-fw pi-receipt',
            routerLink: ['/dados-basicos'],
          },
          {
            label: 'Zoneamento',
            visible: true,
            icon: 'pi pi-fw pi-share-alt',
            routerLink: ['/zoneamento'],
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
