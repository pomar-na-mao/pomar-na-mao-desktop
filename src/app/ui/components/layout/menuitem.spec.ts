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
        label: 'Pomar',
        items: [
          {
            label: 'Visão geral',
            routerLink: ['/pomar/visao-geral'],
          },
        ],
      },
      {
        label: 'Zonas',
        items: [
          {
            label: 'Cadastro de Zonas',
            routerLink: ['/zonas/cadastro'],
          },
        ],
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
          { path: 'pomar/visao-geral', component: EmptyRoute },
          { path: 'zonas/cadastro', component: EmptyRoute },
        ]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('opens the parent submenu when the current route is one of its children', async () => {
    await router.navigateByUrl('/zonas/cadastro');

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const rootItems = Array.from(root.querySelector('.layout-submenu')?.children ?? []) as HTMLElement[];
    const zonesItem = rootItems[1];

    expect(zonesItem.classList.contains('active-menuitem')).toBe(true);
    expect(zonesItem.querySelector('.layout-submenu')?.classList.contains('expanded')).toBe(true);
  });

  it('keeps sibling submenus closed when the current route belongs to another parent', async () => {
    await router.navigateByUrl('/pomar/visao-geral');

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const rootItems = Array.from(root.querySelector('.layout-submenu')?.children ?? []) as HTMLElement[];
    const zonesItem = rootItems[1];

    expect(zonesItem.classList.contains('active-menuitem')).toBe(false);
    expect(zonesItem.querySelector('.layout-submenu')?.classList.contains('collapsed')).toBe(true);
  });

  it('opens the Pomar submenu when the current route is one of its children', async () => {
    await router.navigateByUrl('/pomar/visao-geral');

    const fixture = TestBed.createComponent(MenuHost);
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const rootItems = Array.from(root.querySelector('.layout-submenu')?.children ?? []) as HTMLElement[];
    const orchardItem = rootItems[0];

    expect(orchardItem.classList.contains('active-menuitem')).toBe(true);
    expect(orchardItem.querySelector('.layout-submenu')?.classList.contains('expanded')).toBe(true);
  });
});
