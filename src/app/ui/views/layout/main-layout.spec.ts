import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { LayoutService } from '../../../data/services/shared/layout';
import { AppSidebar } from '../../components/layout/sidebar';
import { AppTopbar } from '../../components/layout/topbar';
import { MainLayout } from './main-layout';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: '<div class="layout-menu-button"></div>',
})
class MockTopbar {}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  template: '<div class="layout-sidebar"></div>',
})
class MockSidebar {}

describe('MainLayout Component', () => {
  let fixture: ComponentFixture<MainLayout>;
  let component: MainLayout;
  let layoutService: LayoutService;

  beforeEach(async () => {
    const mockAuthRepo = {
      user: signal(null),
      currentSession: signal(null),
      isUserLogged: signal(false),
      signOut: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter([]),
        { provide: AuthenticationRepository, useValue: mockAuthRepo },
      ],
    })
      .overrideComponent(MainLayout, {
        remove: { imports: [AppTopbar, AppSidebar] },
        add: { imports: [MockTopbar, MockSidebar] },
      })
      .compileComponents();

    layoutService = TestBed.inject(LayoutService);
    fixture = TestBed.createComponent(MainLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the layout component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute containerClass based on layout config and state', () => {
    layoutService.layoutConfig.set({ menuMode: 'static', darkTheme: true });
    layoutService.layoutState.set({
      staticMenuDesktopInactive: false,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
    });

    let classes = component.containerClass as Record<string, boolean>;
    expect(classes['layout-static']).toBe(true);
    expect(classes['layout-overlay']).toBe(false);
    expect(classes['layout-static-inactive']).toBe(false);

    layoutService.layoutState.update((state) => ({
      ...state,
      staticMenuDesktopInactive: true,
      staticMenuMobileActive: true,
    }));

    classes = component.containerClass as Record<string, boolean>;
    expect(classes['layout-static-inactive']).toBe(true);
    expect(classes['layout-mobile-active']).toBe(true);

    layoutService.layoutConfig.set({ menuMode: 'overlay', darkTheme: true });
    layoutService.layoutState.set({
      overlayMenuActive: true,
    });

    classes = component.containerClass as Record<string, boolean>;
    expect(classes['layout-overlay']).toBe(true);
    expect(classes['layout-overlay-active']).toBe(true);
  });

  it('should hide menu and reset mobile/overlay active flags on hideMenu()', () => {
    layoutService.layoutState.set({
      overlayMenuActive: true,
      staticMenuMobileActive: true,
      menuHoverActive: true,
    });

    component.hideMenu();

    const state = layoutService.layoutState();
    expect(state.overlayMenuActive).toBe(false);
    expect(state.staticMenuMobileActive).toBe(false);
    expect(state.menuHoverActive).toBe(false);
  });

  it('should identify outside clicks accurately', () => {
    const insideEl = document.createElement('div');
    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);

    const event = { target: outsideEl } as unknown as MouseEvent;
    expect(component.isOutsideClicked(event)).toBe(true);

    outsideEl.remove();
  });
});
