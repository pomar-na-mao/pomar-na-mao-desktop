import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('shows My Orchard as the first navigation item', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[0]).toEqual(
      expect.objectContaining({ label: 'Meu Pomar', path: '/meu-pomar' }),
    );
  });

  it('shows Cadastro as the second navigation item', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[1]).toEqual(
      expect.objectContaining({ label: 'Cadastro', path: '/cadastro' }),
    );
  });

  it('shows Registrar immediately below Cadastro with Ocorrências as a child', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[2]).toEqual(
      expect.objectContaining({
        label: 'Registrar',
        items: [
          expect.objectContaining({
            label: 'Ocorrências',
            path: '/registrar/ocorrencias',
          }),
        ],
      }),
    );
  });

  it('shows Atividade de campo immediately below Registrar with Realizadas as a child', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[3]).toEqual(
      expect.objectContaining({
        label: 'Atividade de campo',
        items: [
          expect.objectContaining({
            label: 'Gerar',
            path: '/atividades-de-campo/gerar',
          }),
          expect.objectContaining({
            label: 'Realizadas',
            path: '/atividades-de-campo/realizadas',
          }),
        ],
      }),
    );
  });

  it('shows Mipd immediately below Atividade de campo with Registrar and Realizadas as children', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[4]).toEqual(
      expect.objectContaining({
        label: 'Mipd',
        items: [
          expect.objectContaining({
            label: 'Registrar',
            path: '/mpid/registrar',
          }),
          expect.objectContaining({
            label: 'Realizadas',
            path: '/mpid/realizadas',
          }),
        ],
      }),
    );
  });

  it('expands Registrar and renders the Ocorrências link', () => {
    TestBed.configureTestingModule({ imports: [Sidebar], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Sidebar);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const registerButton = Array.from(root.querySelectorAll('button')).find(
      (button) => button.textContent?.includes('Registrar'),
    );

    expect(registerButton?.getAttribute('aria-expanded')).toBe('false');
    registerButton?.click();
    fixture.detectChanges();

    expect(registerButton?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('a[href="/registrar/ocorrencias"]')?.textContent).toContain(
      'Ocorrências',
    );
  });

  it('does not contain Visão das operações in navigation items', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems.find((item) => item.label === 'Visão das operações')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/visao-das-operacoes')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/operacoes')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/mipd')).toBeUndefined();
  });

  it('does not contain Dados básicos and Zoneamento in navigation items', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems.find((item) => item.label === 'Dados básicos')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/dados-basicos')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.label === 'Zoneamento')).toBeUndefined();
    expect(sidebar.menuItems.find((item) => item.path === '/zoneamento')).toBeUndefined();
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
