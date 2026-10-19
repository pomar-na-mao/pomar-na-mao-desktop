import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Users } from './users';

describe('Users Component', () => {
  let fixture: ComponentFixture<Users>;
  let component: Users;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Users] }).compileComponents();
    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders user identity, role and status data in table', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('tbody tr')).toHaveLength(5);
    expect(root.textContent).toContain('admin@pomarnamao.com');
    expect(root.textContent).toContain('Administrador');
    expect(root.textContent).toContain('Pendente');
  });

  it('provides global search input and table actions', () => {
    const root = fixture.nativeElement as HTMLElement;
    const searchInput = root.querySelector('input[pInputText]');
    expect(searchInput).toBeTruthy();
    expect(root.querySelectorAll('button[aria-label="Editar usuário"]')).toHaveLength(5);
    expect(root.querySelectorAll('button[aria-label="Excluir usuário"]')).toHaveLength(5);
  });

  it('calculates role and status severity appropriately', () => {
    expect(component.getRoleSeverity('Administrador')).toBe('danger');
    expect(component.getRoleSeverity('Editor')).toBe('info');
    expect(component.getRoleSeverity('Visualizador')).toBe('secondary');

    expect(component.getStatusSeverity('Ativo')).toBe('success');
    expect(component.getStatusSeverity('Inativo')).toBe('danger');
    expect(component.getStatusSeverity('Pendente')).toBe('warn');
  });
});
