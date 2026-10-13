import { describe, expect, it } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('should show zones navigation directly below mass inclusion without separate assignment entry', () => {
    const sidebar = new Sidebar();
    const massInclusionIndex = sidebar.menuItems.findIndex(
      (item) => item.path === '/inclusoes-em-massa',
    );

    expect(massInclusionIndex).toBeGreaterThanOrEqual(0);
    expect(sidebar.menuItems[massInclusionIndex + 1]).toEqual(
      expect.objectContaining({
        label: 'Zonas',
        path: '/zonas',
      }),
    );
    expect(
      sidebar.menuItems.find((item) => item.path === '/atribuicao-zonas'),
    ).toBeUndefined();
  });
});