import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('shows overview as the first navigation item', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[0]).toEqual(
      expect.objectContaining({ label: 'Visão geral', path: '/visao-geral' }),
    );
  });

  it('shows Cadastro as the second navigation item', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[1]).toEqual(
      expect.objectContaining({ label: 'Cadastro', path: '/cadastro' }),
    );
  });

  it('shows Atividades de campo immediately below Cadastro', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[2]).toEqual(
      expect.objectContaining({
        label: 'Atividades de campo',
        path: '/atividades-de-campo',
      }),
    );
  });

  it('shows Visão das operações as a single navigation item', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems).toContainEqual(
      expect.objectContaining({
        label: 'Visão das operações',
        path: '/visao-das-operacoes',
      }),
    );
    expect(sidebar.menuItems.find((item) => item.path === '/operacoes')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/mipd')).toBeUndefined();
  });

  it('should show zoning navigation directly below basic data', () => {
    const sidebar = new Sidebar();
    const basicDataIndex = sidebar.menuItems.findIndex(
      (item) => item.path === '/dados-basicos',
    );

    expect(basicDataIndex).toBeGreaterThanOrEqual(0);
    expect(sidebar.menuItems[basicDataIndex + 1]).toEqual(
      expect.objectContaining({
        label: 'Zoneamento',
        path: '/zoneamento',
      }),
    );
    expect(
      sidebar.menuItems.find((item) => item.path === '/zonas'),
    ).toBeUndefined();
  });

  it('renders an accessible mobile drawer and emits close intent from its backdrop', () => {
    TestBed.configureTestingModule({ imports: [Sidebar], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('isMobileOpen', true);
    const close = vi.fn();
    fixture.componentInstance.navigationSelected.subscribe(close);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const aside = root.querySelector('#app-navigation');
    const backdrop = root.querySelector<HTMLButtonElement>('button[aria-label="Fechar navegação"]');
    expect(aside?.className).toContain('-translate-x-full');
    expect(aside?.className).toContain('md:translate-x-0');
    expect(backdrop).toBeTruthy();
    backdrop?.click();
    expect(close).toHaveBeenCalledOnce();
  });
});
