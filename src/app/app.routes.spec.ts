import { describe, expect, it } from 'vitest';
import { ROUTES } from './app.routes';

describe('ROUTES', () => {
  it('should expose zone management as an authenticated child route', () => {
    const mainRoute = ROUTES.find((route) => route.path === '');
    const childPaths = mainRoute?.children?.map((route) => route.path);

    expect(childPaths).toContain('zonas');
    expect(childPaths).toEqual(
      expect.arrayContaining([
        'inicio',
        'operacoes',
        'inclusoes-em-massa',
        'zonas',
        'configuracoes',
        'usuarios',
      ]),
    );
  });
});
