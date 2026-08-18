import { describe, expect, it } from 'vitest';
import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  it('should show zone management immediately below mass inclusion', () => {
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
  });
});
