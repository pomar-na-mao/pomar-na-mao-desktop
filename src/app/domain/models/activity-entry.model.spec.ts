import { describe, expect, it } from 'vitest';
import { buildActivityGeometry, validateActivityGeometry } from './activity-entry.model';

describe('activity entry model', () => {
  it('builds the same GeoJSON contracts accepted by sync_activity_entries', () => {
    expect(buildActivityGeometry('route', [[-49.1, -23.4], [-49.2, -23.5]])).toEqual({
      type: 'LineString',
      coordinates: [[-49.1, -23.4], [-49.2, -23.5]],
    });
    expect(buildActivityGeometry('area', [[-49.1, -23.4], [-49.2, -23.4], [-49.2, -23.5]])).toEqual({
      type: 'Polygon',
      coordinates: [[[-49.1, -23.4], [-49.2, -23.4], [-49.2, -23.5], [-49.1, -23.4]]],
    });
  });

  it('enforces the mobile minimum point counts', () => {
    expect(validateActivityGeometry('route', [[-49.1, -23.4]])).toContain('dois pontos');
    expect(validateActivityGeometry('area', [[-49.1, -23.4], [-49.2, -23.4]])).toContain('três pontos');
    expect(validateActivityGeometry('route', [[-49.1, -23.4], [-49.2, -23.5]])).toBeNull();
  });
});
