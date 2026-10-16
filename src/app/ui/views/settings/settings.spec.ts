import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { Settings } from './settings';

describe('Settings', () => {
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [{
        provide: UsersRepository,
        useValue: { currentUser: signal({ full_name: 'Ana Pomar', email: 'ana@example.com', isAdmin: true, avatar_url: null }) },
      }],
    }).compileComponents();
    fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
  });

  it('keeps profile values disabled in a responsive one/two-column grid', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.grid.grid-cols-1.md\\:grid-cols-2')).toBeTruthy();
    expect(root.querySelectorAll('app-input input:disabled')).toHaveLength(4);
    expect(root.textContent).toContain('Ana Pomar');
  });

  it('switches tabs and exposes accessible tab state with overflow-safe navigation', () => {
    const root = fixture.nativeElement as HTMLElement;
    const tablist = root.querySelector<HTMLElement>('[role="tablist"]');
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tablist?.classList.contains('overflow-x-auto')).toBe(true);

    tabs[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeTab).toBe('seguranca');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('stacks profile actions on mobile and uses shared buttons', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.flex.flex-col-reverse.sm\\:flex-row')).toBeTruthy();
    expect(root.querySelectorAll('button.ui-btn').length).toBeGreaterThanOrEqual(4);
    expect(root.querySelector('button[aria-label="Alterar foto do perfil"]')).toBeTruthy();
  });
});
