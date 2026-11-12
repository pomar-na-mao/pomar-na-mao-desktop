import { describe, expect, it } from 'vitest';
import { ROUTES } from './app.routes';

describe('ROUTES', () => {
  it('should expose authenticated child routes without basic data and zoning', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const childPaths = mainRoute?.children?.map((route) => route.path);

    expect(childPaths).not.toContain('zoneamento');
    expect(childPaths).not.toContain('dados-basicos');
    expect(childPaths).not.toContain('atribuicao-zonas');
    expect(childPaths).toEqual(
      expect.arrayContaining([
        'visao-geral',
        'cadastro',
        'atividades-de-campo',
        'registrar',
        'configuracoes',
        'usuarios',
      ]),
    );
  });

  it('should lazy-load polygon occurrences under /registrar/ocorrencias', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const registerRoute = mainRoute?.children?.find((route) => route.path === 'registrar');
    const occurrencesRoute = registerRoute?.children?.find(
      (route) => route.path === 'ocorrencias',
    );

    expect(occurrencesRoute?.loadComponent).toBeDefined();
    const loadFn = occurrencesRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
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
