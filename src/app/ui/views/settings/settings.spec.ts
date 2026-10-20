import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { LayoutService } from '../../../data/services/shared/layout';
import { Settings } from './settings';

describe('Settings', () => {
  let fixture: ComponentFixture<Settings>;
  let component: Settings;
  let layoutService: LayoutService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [
        {
          provide: UsersRepository,
          useValue: {
            currentUser: signal({
              full_name: 'Ana Pomar',
              email: 'ana@example.com',
              isAdmin: true,
              avatar_url: null,
            }),
          },
        },
      ],
    }).compileComponents();
    layoutService = TestBed.inject(LayoutService);
    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('keeps profile values disabled in a responsive grid', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')).toBeTruthy();
    expect(root.querySelectorAll('input:disabled')).toHaveLength(4);
    expect(root.textContent).toContain('Ana Pomar');
    expect(root.textContent).toContain('ana@example.com');
    expect(root.textContent).toContain('Administrador');
  });

  it('switches tabs and renders tab options', () => {
    const root = fixture.nativeElement as HTMLElement;
    const tabs = root.querySelectorAll('p-tab');
    expect(tabs.length).toBe(4);
    expect(component.activeTab).toBe('perfil');

    component.activeTab = 'seguranca';
    fixture.detectChanges();
    expect(component.activeTab).toBe('seguranca');
  });

  it('toggles dark theme via toggleDarkMode', () => {
    layoutService.layoutConfig.set({ darkTheme: false });
    component.toggleDarkMode();
    expect(layoutService.layoutConfig().darkTheme).toBe(true);
    component.toggleDarkMode();
    expect(layoutService.layoutConfig().darkTheme).toBe(false);
  });
});
