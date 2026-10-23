import { describe, expect, it } from 'vitest';
import routes from './orchard.routes';

describe('Orchard routes', () => {
  it('should redirect /pomar to the overview route', () => {
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute?.redirectTo).toBe('visao-geral');
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('should expose overview, varieties and occurrences child routes', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '',
      'visao-geral',
      'variedades',
      'ocorrencias',
    ]);
  });

  it.each(['visao-geral', 'variedades', 'ocorrencias'])(
    'should lazy-load the %s component',
    async (path) => {
      const route = routes.find((candidate) => candidate.path === path);

      expect(route?.loadComponent).toBeDefined();
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    },
  );
});
