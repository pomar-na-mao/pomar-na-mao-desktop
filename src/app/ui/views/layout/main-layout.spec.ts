import { describe, expect, it, vi } from 'vitest';
import { MainLayout } from './main-layout';

describe('MainLayout responsive navigation', () => {
  it('uses the existing toggle intent for the mobile drawer', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const component = new MainLayout();
    component.toggleSidebar();
    expect(component.isMobileSidebarOpen()).toBe(true);
    expect(component.isSidebarCollapsed()).toBe(false);
  });

  it('keeps desktop collapse separate from mobile state', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
    const component = new MainLayout();
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
    expect(component.isMobileSidebarOpen()).toBe(false);
  });

  it('closes on Escape intent and returns focus to the navigation toggle', async () => {
    const component = new MainLayout();
    const focusNavigationToggle = vi.fn();
    component.header = { focusNavigationToggle } as never;
    component.isMobileSidebarOpen.set(true);
    component.closeNavigationOnEscape();
    await Promise.resolve();
    expect(component.isMobileSidebarOpen()).toBe(false);
    expect(focusNavigationToggle).toHaveBeenCalledOnce();
  });
});
