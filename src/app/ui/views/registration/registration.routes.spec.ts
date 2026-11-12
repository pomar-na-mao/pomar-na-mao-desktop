import { describe, expect, it } from 'vitest';
import routes from './registration.routes';

describe('Registration routes', () => {
  it('should redirect /cadastro to the overview route', () => {
    const defaultRoute = routes.find((route) => route.path === '');

    expect(defaultRoute?.redirectTo).toBe('/meu-pomar');
    expect(defaultRoute?.pathMatch).toBe('full');
  });

  it('should expose all registration child routes', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '',
      'propriedade',
      'zonas',
      'variedades',
      'ocorrencias',
      'estoque',
      'caldas',
      'maquinas',
      'infraestrutura',
    ]);
  });

  it.each([
    'propriedade',
    'variedades',
    'ocorrencias',
    'zonas',
    'estoque',
    'caldas',
    'maquinas',
    'infraestrutura',
  ])('should lazy-load the %s component', async (path) => {
    const route = routes.find((entry) => entry.path === path);

    expect(route).toBeDefined();
    expect(route?.loadComponent).toBeTypeOf('function');

    const component = await route?.loadComponent?.();
    expect(component).toBeDefined();
  });
});
