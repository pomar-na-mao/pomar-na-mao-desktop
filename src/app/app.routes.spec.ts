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
        'inclusoes-em-massa',
        'zonas',
        'configuracoes',
        'usuarios',
      ]),
    );
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
});
