import { describe, expect, it } from 'vitest';
import { ROUTES } from './app.routes';

describe('ROUTES', () => {
  it('should expose zone management as an authenticated child route', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const childPaths = mainRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain('zonas');
    expect(childPaths).toEqual(
      expect.arrayContaining([
        'pomar',
        'operacoes',
        'mipd',
        'inclusoes-em-massa',
        'zonas',
        'configuracoes',
        'usuarios',
      ]),
    );
  });

  it('should lazy-load the MIPD screen for /mipd', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const mipdRoute = mainRoute?.children?.find(
      (route) => route.path === 'mipd',
    );

    expect(mipdRoute?.loadComponent).toBeDefined();
    const loadFn = mipdRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
  });

  it('should redirect legacy atribuicao-zonas to zonas', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const atribuicaoRoute = mainRoute?.children?.find(
      (route) => route.path === 'atribuicao-zonas',
    );

    expect(atribuicaoRoute).toBeDefined();
    expect(atribuicaoRoute?.redirectTo).toBe('zonas/atribuicao');
  });

  it('should lazy-load the unified Zones component for /zonas', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const zonasRoute = mainRoute?.children?.find(
      (route) => route.path === 'zonas',
    );

    expect(zonasRoute?.loadComponent).toBeDefined();
    const loadFn = zonasRoute?.loadComponent as () => Promise<unknown>;
    const component = await loadFn();
    expect(component).toBeDefined();
  });

  it('should lazy-load the Orchard shell with child routes for /pomar', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const pomarRoute = mainRoute?.children?.find(
      (route) => route.path === 'pomar',
    );

    expect(pomarRoute?.loadComponent).toBeDefined();
    expect(pomarRoute?.children?.[0]?.loadChildren).toBeDefined();

    const loadFn = pomarRoute?.loadComponent as () => Promise<unknown>;
    const component = await loadFn();
    expect(component).toBeDefined();
  });
});
