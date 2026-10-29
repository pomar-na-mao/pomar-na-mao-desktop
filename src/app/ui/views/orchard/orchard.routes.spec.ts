import { describe, expect, it } from 'vitest';
import routes from './orchard.routes';

describe('Orchard routes', () => {
  it('should redirect /cadastro to the overview route', () => {
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute?.redirectTo).toBe('/visao-geral');
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('should expose all registration child routes', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '',
      'variedades',
      'ocorrencias',
      'zonas',
      'insumos',
      'caldas',
      'infraestrutura',
      'maquinas',
    ]);
  });

  it.each([
    'variedades',
    'ocorrencias',
    'zonas',
    'insumos',
    'caldas',
    'infraestrutura',
    'maquinas',
  ])(
    'should lazy-load the %s component',
    async (path) => {
      const route = routes.find((candidate) => candidate.path === path);

      expect(route?.loadComponent).toBeDefined();
      const component = await route?.loadComponent?.();
      expect(component).toBeDefined();
    },
  );
});
