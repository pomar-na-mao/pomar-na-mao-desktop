import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Users } from './users';

describe('Users', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Users] }).compileComponents();
  });

  it('renders unchanged user identity, role and status data', () => {
    const fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(root.textContent).toContain('admin@example.com');
    expect(root.textContent).toContain('Administrador');
    expect(root.textContent).toContain('Pendente');
  });

  it('provides labeled mobile cells without a fixed minimum width', () => {
    const fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const table = root.querySelector('table');
    expect(table?.className).toContain('users-table');
    expect(table?.className).not.toContain('min-w-');
    expect(root.querySelectorAll('td[data-label]').length).toBe(20);
  });

  it('uses semantic badges, accessible actions and shared hover/focus row treatment', () => {
    const fixture = TestBed.createComponent(Users);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-input')).toBeTruthy();
    expect(root.querySelectorAll('.ui-table-row')).toHaveLength(5);
    expect(root.querySelectorAll('.ui-badge[data-ui-status]').length).toBe(5);
    expect(root.querySelectorAll('button[aria-label="Editar usuário"]')).toHaveLength(5);
    expect(root.querySelectorAll('button[aria-label="Excluir usuário"]')).toHaveLength(5);
  });
});
