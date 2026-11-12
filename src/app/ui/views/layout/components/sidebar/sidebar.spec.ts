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

  it('shows Atividades de campo immediately below Registrar', () => {
    const sidebar = new Sidebar();

    expect(sidebar.menuItems[3]).toEqual(
      expect.objectContaining({
        label: 'Atividades de campo',
        path: '/atividades-de-campo',
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
