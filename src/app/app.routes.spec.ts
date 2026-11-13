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
        'meu-pomar',
        'cadastro',
        'atividades-de-campo',
        'mpid',
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

  it('should lazy-load My Orchard as a root authenticated route', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const myOrchardRoute = mainRoute?.children?.find(
      (route) => route.path === 'meu-pomar',
    );

    expect(myOrchardRoute?.loadComponent).toBeDefined();
    const loadFn = myOrchardRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
  });

  it('should expose completed operations under /atividades-de-campo/realizadas', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const fieldActivitiesRoute = mainRoute?.children?.find(
      (route) => route.path === 'atividades-de-campo',
    );
    const defaultRoute = fieldActivitiesRoute?.children?.find(
      (route) => route.path === '',
    );
    const completedRoute = fieldActivitiesRoute?.children?.find(
      (route) => route.path === 'realizadas',
    );
    const generateRoute = fieldActivitiesRoute?.children?.find(
      (route) => route.path === 'gerar',
    );

    expect(defaultRoute).toMatchObject({
      redirectTo: 'realizadas',
      pathMatch: 'full',
    });
    expect(completedRoute?.loadComponent).toBeDefined();
    const loadFn = completedRoute?.loadComponent as () => Promise<unknown>;
    await expect(loadFn()).resolves.toBeDefined();
    expect(generateRoute?.loadComponent).toBeDefined();
    const generateLoadFn = generateRoute?.loadComponent as () => Promise<unknown>;
    await expect(generateLoadFn()).resolves.toBeDefined();
  });

  it('should lazy-load the Registration shell with child routes for /cadastro', async () => {
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

  it('should expose MIPD operations under /mpid with registrar and realizadas subroutes', async () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const mpidRoute = mainRoute?.children?.find((route) => route.path === 'mpid');
    const defaultRoute = mpidRoute?.children?.find((route) => route.path === '');
    const completedRoute = mpidRoute?.children?.find((route) => route.path === 'realizadas');
    const registerRoute = mpidRoute?.children?.find((route) => route.path === 'registrar');

    expect(defaultRoute).toMatchObject({
      redirectTo: 'realizadas',
      pathMatch: 'full',
    });
    expect(completedRoute?.loadComponent).toBeDefined();
    const completedLoadFn = completedRoute?.loadComponent as () => Promise<unknown>;
    await expect(completedLoadFn()).resolves.toBeDefined();

    expect(registerRoute?.loadComponent).toBeDefined();
    const registerLoadFn = registerRoute?.loadComponent as () => Promise<unknown>;
    await expect(registerLoadFn()).resolves.toBeDefined();

    const mipdAlias = mainRoute?.children?.find((route) => route.path === 'mipd');
    expect(mipdAlias).toMatchObject({ redirectTo: 'mpid' });
  });
});
