import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppMenuitem } from './menuitem';

@Component({
  standalone: true,
  template: '',
})
class EmptyRoute {}

@Component({
  standalone: true,
  imports: [AppMenuitem],
  template: `<ul class="layout-menu">
    <li app-menuitem [item]="item" [index]="0" [root]="true"></li>
  </ul>`,
})
class MenuHost {
  public item: MenuItem = {
    label: 'Menu',
    items: [
      {
        label: 'Visão geral',
        routerLink: ['/visao-geral'],
      },
      {
        label: 'Cadastro',
        items: [
          {
            label: 'Variedades',
            routerLink: ['/cadastro/variedades'],
          },
          {
            label: 'Zonas',
            routerLink: ['/cadastro/zonas'],
          },
        ],
      },
      {
        label: 'Zoneamento',
        routerLink: ['/zoneamento'],
      },
    ],
  };
}

describe('AppMenuitem', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuHost],
      providers: [
        provideRouter([
          { path: 'visao-geral', component: EmptyRoute },
          { path: 'cadastro/variedades', component: EmptyRoute },
          { path: 'cadastro/zonas', component: EmptyRoute },
          { path: 'zoneamento', component: EmptyRoute },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('keeps sibling submenus closed when the current route belongs to another parent', async () => {
    await router.navigateByUrl('/visao-geral');

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const rootItems = Array.from(root.querySelector('.layout-submenu')?.children ?? []) as HTMLElement[];
    const registrationItem = rootItems[1];

    expect(registrationItem.classList.contains('active-menuitem')).toBe(false);
    expect(registrationItem.querySelector('.layout-submenu')?.classList.contains('collapsed')).toBe(true);
  });

  it('opens the Cadastro submenu when the current route is one of its children', async () => {
    await router.navigateByUrl('/cadastro/zonas');

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const rootItems = Array.from(root.querySelector('.layout-submenu')?.children ?? []) as HTMLElement[];
    const registrationItem = rootItems[1];

    expect(registrationItem.classList.contains('active-menuitem')).toBe(true);
    expect(registrationItem.querySelector('.layout-submenu')?.classList.contains('expanded')).toBe(true);
  });
});
