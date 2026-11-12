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
            label: 'Meu Pomar',
            visible: true,
            icon: 'pi pi-fw pi-apple',
            routerLink: ['/meu-pomar'],
          },
          {
            label: 'Cadastro',
            visible: true,
            icon: 'pi pi-fw pi-file-import',
            items: [
              {
                label: 'Demarcação propriedade',
                visible: true,
                icon: 'pi pi-fw pi-map-marker',
                routerLink: ['/cadastro/propriedade'],
              },
              {
                label: 'Demarcação zonas',
                visible: true,
                icon: 'pi pi-fw pi-map',
                routerLink: ['/cadastro/zonas'],
              },
              {
                label: 'Atribuição variedades',
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
                label: 'Estoque',
                visible: true,
                icon: 'pi pi-fw pi-box',
                routerLink: ['/cadastro/estoque'],
              },
              {
                label: 'Caldas e mesclas',
                visible: true,
                icon: 'pi pi-fw pi-filter',
                routerLink: ['/cadastro/caldas'],
              },
              {
                label: 'Máquinas',
                visible: true,
                icon: 'pi pi-fw pi-cog',
                routerLink: ['/cadastro/maquinas'],
              },
              /* {
                label: 'Infraestrutura',
                visible: true,
                icon: 'pi pi-fw pi-building',
                routerLink: ['/cadastro/infraestrutura'],
              }, */
            ],
          },
          {
            label: 'Registrar',
            visible: true,
            icon: 'pi pi-fw pi-pencil',
            items: [
              {
                label: 'Ocorrências',
                visible: true,
                icon: 'pi pi-fw pi-exclamation-circle',
                routerLink: ['/registrar/ocorrencias'],
              },
            ],
          },
          {
            label: 'Atividades de campo',
            visible: true,
            icon: 'pi pi-fw pi-book',
            routerLink: ['/atividades-de-campo'],
          },
          /* {
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
          }, */
        ],
      },
    ];
  }
}
