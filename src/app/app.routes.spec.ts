import { describe, expect, it } from 'vitest';
import { ROUTES } from './app.routes';

describe('ROUTES', () => {
  it('should expose zoning as an authenticated child route', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const childPaths = mainRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain('zoneamento');
    expect(childPaths).toEqual(
      expect.arrayContaining([
        'visao-geral',
        'cadastro',
        'atividades-de-campo',
        'visao-das-operacoes',
        'dados-basicos',
        'zoneamento',
        'configuracoes',
        'usuarios',
      ]),
    );
  });

  it('should lazy-load overview as a root authenticated route', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const overviewRoute = mainRoute?.children?.find(
      (route) => route.path === 'visao-geral',
    );

    expect(overviewRoute?.loadComponent).toBeDefined();
    const loadFn = overviewRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
  });

  it('should expose completed operations under /atividades-de-campo', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const fieldActivitiesRoute = mainRoute?.children?.find(
      (route) => route.path === 'atividades-de-campo',
    );

    expect(fieldActivitiesRoute?.loadComponent).toBeDefined();
    const loadFn = fieldActivitiesRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
  });

  it('should group operations and MIPD under /visao-das-operacoes', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const operationsViewRoute = mainRoute?.children?.find(
      (route) => route.path === 'visao-das-operacoes',
    );
    const childPaths = operationsViewRoute?.children?.map(
      (route) => route.path,
    );

    expect(operationsViewRoute?.loadComponent).toBeUndefined();
    expect(childPaths).toEqual(['', 'operacoes', 'mipd']);
    expect(operationsViewRoute?.children?.[0]?.redirectTo).toBe('operacoes');

    const mipdRoute = operationsViewRoute?.children?.find(
      (route) => route.path === 'mipd',
    );
    expect(mipdRoute?.loadComponent).toBeDefined();
    const loadFn = mipdRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();

    const operationsRoute = operationsViewRoute?.children?.find(
      (route) => route.path === 'operacoes',
    );
    expect(operationsRoute?.loadComponent).toBeDefined();
    const loadOperations = operationsRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadOperations()).resolves.toBeDefined();
  });

  it('should redirect legacy atribuicao-zonas to zoneamento', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const atribuicaoRoute = mainRoute?.children?.find(
      (route) => route.path === 'atribuicao-zonas',
    );

    expect(atribuicaoRoute).toBeDefined();
    expect(atribuicaoRoute?.redirectTo).toBe('zoneamento');
  });

  it('should lazy-load ZoneAssignment directly for /zoneamento', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const zoningRoute = mainRoute?.children?.find(
      (route) => route.path === 'zoneamento',
    );

    expect(zoningRoute?.loadComponent).toBeDefined();
    expect(zoningRoute?.children).toBeUndefined();
    const loadFn = zoningRoute?.loadComponent as () => Promise<unknown>;
    const component = await loadFn();
    expect(component).toBeDefined();
  });

  it('should lazy-load the Orchard shell with child routes for /cadastro', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const registrationRoute = mainRoute?.children?.find(
      (route) => route.path === 'cadastro',
    );

    expect(registrationRoute?.loadComponent).toBeDefined();
    expect(registrationRoute?.children?.[0]?.loadChildren).toBeDefined();

    const loadFn = registrationRoute?.loadComponent as () => Promise<unknown>;
    const component = await loadFn();
    expect(component).toBeDefined();
  });
});
