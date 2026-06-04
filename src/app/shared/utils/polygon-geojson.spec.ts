import { describe, expect, it } from 'vitest';
import { toClosedGeoJsonPolygon } from './polygon-geojson';

describe('toClosedGeoJsonPolygon', () => {
  it('should convert lat/lng coordinates to closed GeoJSON lng/lat order', () => {
    const polygon = toClosedGeoJsonPolygon([
      { lat: -21.23, lng: -47.79 },
      { lat: -21.24, lng: -47.78 },
      { lat: -21.25, lng: -47.80 },
    ]);

    expect(polygon).toEqual({
      type: 'Polygon',
      coordinates: [[
        [-47.79, -21.23],
        [-47.78, -21.24],
        [-47.80, -21.25],
        [-47.79, -21.23],
      ]],
    });
  });

  it('should not duplicate an already closed ring', () => {
    const polygon = toClosedGeoJsonPolygon([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
      { lat: 1, lng: 2 },
    ]);

    expect(polygon.coordinates[0]).toHaveLength(4);
  });

  it('should reject invalid polygons', () => {
    expect(() => toClosedGeoJsonPolygon([{ lat: 1, lng: 2 }])).toThrow();
    expect(() => toClosedGeoJsonPolygon([
      { lat: 1, lng: 2 },
      { lat: Number.NaN, lng: 4 },
      { lat: 5, lng: 6 },
    ])).toThrow();
  });
});
