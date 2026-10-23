import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('shows Mipd immediately below operations', () => {
    const sidebar = new Sidebar();
    const operationsIndex = sidebar.menuItems.findIndex(
      (item) => item.path === '/operacoes',
    );

    expect(sidebar.menuItems[operationsIndex + 1]).toEqual(
      expect.objectContaining({ label: 'Mipd', path: '/mipd' }),
    );
  });

  it('should show zones navigation directly below mass inclusion without separate assignment entry', () => {
    const sidebar = new Sidebar();
    const massInclusionIndex = sidebar.menuItems.findIndex(
      (item) => item.path === '/inclusoes-em-massa',
    );

    expect(massInclusionIndex).toBeGreaterThanOrEqual(0);
    expect(sidebar.menuItems[massInclusionIndex + 1]).toEqual(
      expect.objectContaining({
        label: 'Zonas',
        path: '/zonas',
      }),
    );
    expect(
      sidebar.menuItems.find((item) => item.path === '/atribuicao-zonas'),
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
