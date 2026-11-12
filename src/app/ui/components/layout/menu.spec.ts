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

  it('shows My Orchard first and outside the registration submenu', () => {
    const fixture = TestBed.createComponent(AppMenu);
    fixture.detectChanges();

    const items = fixture.componentInstance.menuItems[0].items ?? [];
    const registrationItem = items.find((item) => item.label === 'Cadastro');
    const registrationItems = registrationItem?.items ?? [];

    expect(items[0]).toMatchObject({
      label: 'Meu Pomar',
      icon: 'pi pi-fw pi-apple',
      routerLink: ['/meu-pomar'],
    });
    expect(registrationItem).toMatchObject({
      icon: 'pi pi-fw pi-file-import',
    });
    expect(registrationItems.map((item) => item.routerLink?.[0])).toEqual([
      '/cadastro/propriedade',
      '/cadastro/zonas',
      '/cadastro/variedades',
      '/cadastro/ocorrencias',
      '/cadastro/estoque',
      '/cadastro/caldas',
      '/cadastro/maquinas',
    ]);
    expect(registrationItems[0]).toMatchObject({
      label: 'Demarcação propriedade',
      icon: 'pi pi-fw pi-map-marker',
    });
    expect(registrationItems[1]).toMatchObject({
      label: 'Demarcação zonas',
      icon: 'pi pi-fw pi-map',
    });

    expect(items.find((item) => item.label === 'Zoneamento')).toBeUndefined();
    expect(items.find((item) => item.label === 'Dados básicos')).toBeUndefined();
    expect(items.find((item) => item.label === 'Zonas')).toBeUndefined();

    const registrationIndex = items.findIndex(
      (item) => item.label === 'Cadastro',
    );
    const registerItem = items[registrationIndex + 1];
    expect(registerItem).toMatchObject({
      label: 'Registrar',
      icon: 'pi pi-fw pi-pencil',
    });
    expect(registerItem.items).toHaveLength(1);
    expect(registerItem.items?.[0]).toMatchObject({
      label: 'Ocorrências',
      icon: 'pi pi-fw pi-exclamation-circle',
      routerLink: ['/registrar/ocorrencias'],
    });
    expect(items[registrationIndex + 2]).toMatchObject({
      label: 'Atividade de campo',
      icon: 'pi pi-fw pi-book',
      items: [
        expect.objectContaining({
          label: 'Realizadas',
          icon: 'pi pi-fw pi-check-circle',
          routerLink: ['/atividades-de-campo/realizadas'],
        }),
      ],
    });
  });

  it('does not contain Visão das operações or its child routes', () => {
    const fixture = TestBed.createComponent(AppMenu);
    fixture.detectChanges();

    const items = fixture.componentInstance.menuItems[0].items ?? [];
    const operationsView = items.find(
      (item) => item.label === 'Visão das operações',
    );

    expect(operationsView).toBeUndefined();
    expect(items.find((item) => item.routerLink?.[0] === '/visao-das-operacoes/operacoes')).toBeUndefined();
    expect(items.find((item) => item.routerLink?.[0] === '/visao-das-operacoes/mipd')).toBeUndefined();
    expect(items.find((item) => item.routerLink?.[0] === '/operacoes')).toBeUndefined();
    expect(items.find((item) => item.routerLink?.[0] === '/mipd')).toBeUndefined();
  });
});
