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

  it('shows Mipd between Operações and Dados básicos', () => {
    const fixture = TestBed.createComponent(AppMenu);
    fixture.detectChanges();

    const items = fixture.componentInstance.menuItems[0].items ?? [];
    const operationsIndex = items.findIndex((item) => item.routerLink?.[0] === '/operacoes');

    expect(operationsIndex).toBeGreaterThanOrEqual(0);
    expect(items[operationsIndex + 1]).toMatchObject({
      label: 'Mipd',
      icon: 'pi pi-fw pi-shield',
      routerLink: ['/mipd'],
    });
    expect(items[operationsIndex + 2]).toMatchObject({
      label: 'Dados básicos',
      icon: 'pi pi-fw pi-receipt',
      routerLink: ['/dados-basicos'],
    });
  });
});
