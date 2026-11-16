import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { UserRolesRepository } from '../../../data/repositories/user-roles/user-roles-repository';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { TenantSwitchService } from '../../../data/services/tenant-switch/tenant-switch.service';
import { AppSidebar } from './sidebar';

describe('AppSidebar', () => {
  let fixture: ComponentFixture<AppSidebar>;
  const isUserAdmin = signal(false);

  beforeEach(async () => {
    isUserAdmin.set(false);
    await TestBed.configureTestingModule({
      imports: [AppSidebar],
      providers: [
        provideRouter([]),
        { provide: UserRolesRepository, useValue: { isUserAdmin } },
        { provide: AuthenticationRepository, useValue: {} },
        {
          provide: TenantSwitchService,
          useValue: {
            activeClientId: signal('ricardoAbacate'),
            busy: signal(false),
            errorMessage: signal(null),
            switchTenant: async () => ({ ok: true, status: 'unchanged' }),
            cancel: () => undefined,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppSidebar);
  });

  it('does not expose the tenant selector for user or unresolved roles', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-tenant-switcher')).toBeNull();
  });

  it('renders the selector in the sidebar footer for administrators', () => {
    isUserAdmin.set(true);
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('.layout-sidebar');
    const switcher = sidebar.querySelector('app-tenant-switcher');
    expect(switcher).toBeTruthy();
    expect(sidebar.lastElementChild).toBe(switcher);
    expect(sidebar.classList.contains('flex-col')).toBe(true);
    expect(sidebar.classList.contains('overflow-hidden')).toBe(true);
    const menuRegion = sidebar.firstElementChild;
    expect(menuRegion.classList.contains('mb-4')).toBe(true);
    expect(menuRegion.classList.contains('layout-menu-scroll')).toBe(true);
    expect(menuRegion.classList.contains('overflow-y-auto')).toBe(true);
    expect(switcher.classList.contains('shrink-0')).toBe(true);
    expect(switcher.classList.contains('border-t')).toBe(true);
    expect(switcher.classList.contains('pt-3')).toBe(true);
  });
});
