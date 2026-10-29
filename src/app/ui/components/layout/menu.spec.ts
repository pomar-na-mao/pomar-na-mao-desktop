import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';
import { AppMenu } from './menu';

describe('AppMenu', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMenu],
      providers: [
        provideRouter([]),
        { provide: AuthenticationRepository, useValue: {} },
        { provide: UserRolesRepository, useValue: {} },
      ],
    }).compileComponents();
  });

  it('shows overview first and outside the registration submenu', () => {
    const fixture = TestBed.createComponent(AppMenu);
    fixture.detectChanges();

    const items = fixture.componentInstance.menuItems[0].items ?? [];
    const registrationItem = items.find((item) => item.label === 'Cadastro');
    const registrationItems = registrationItem?.items ?? [];

    expect(items[0]).toMatchObject({
      label: 'Visão geral',
      icon: 'pi pi-fw pi-chart-bar',
      routerLink: ['/visao-geral'],
    });
    expect(registrationItem).toMatchObject({
      icon: 'pi pi-fw pi-file-import',
    });
    expect(registrationItems.map((item) => item.routerLink?.[0])).toEqual([
      '/cadastro/variedades',
      '/cadastro/ocorrencias',
      '/cadastro/zonas',
      '/cadastro/insumos',
      '/cadastro/caldas',
      '/cadastro/infraestrutura',
      '/cadastro/maquinas',
    ]);
    expect(registrationItems[2]).toMatchObject({
      label: 'Zonas',
      icon: 'pi pi-fw pi-map',
    });

    expect(items.find((item) => item.label === 'Zoneamento')).toMatchObject({
      icon: 'pi pi-fw pi-share-alt',
      routerLink: ['/zoneamento'],
    });
    expect(items.find((item) => item.label === 'Zonas')).toBeUndefined();

    const registrationIndex = items.findIndex(
      (item) => item.label === 'Cadastro',
    );
    expect(items[registrationIndex + 1]).toMatchObject({
      label: 'Atividades de campo',
      icon: 'pi pi-fw pi-book',
      routerLink: ['/atividades-de-campo'],
    });
  });

  it('groups Operações and Mipd under Visão das operações', () => {
    const fixture = TestBed.createComponent(AppMenu);
    fixture.detectChanges();

    const items = fixture.componentInstance.menuItems[0].items ?? [];
    const operationsView = items.find(
      (item) => item.label === 'Visão das operações',
    );

    expect(operationsView).toMatchObject({
      icon: 'pi pi-fw pi-hammer',
    });
    expect(operationsView?.items?.map((item) => item.routerLink?.[0])).toEqual([
      '/visao-das-operacoes/operacoes',
      '/visao-das-operacoes/mipd',
    ]);
    expect(items.find((item) => item.routerLink?.[0] === '/operacoes')).toBeUndefined();
    expect(items.find((item) => item.routerLink?.[0] === '/mipd')).toBeUndefined();
  });
});
