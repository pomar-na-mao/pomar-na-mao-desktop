import { describe, expect, it } from 'vitest';
import {
  buildOrderedMapBoundary,
  normalizeOrderedBoundaryPoints,
} from './ordered-map-boundary';

describe('ordered map boundary helpers', () => {
  it('should normalize valid points in ascending order', () => {
    const result = normalizeOrderedBoundaryPoints([
      { id: '3', latitude: -23.3, longitude: -49.3, order: 3 },
      { id: '1', latitude: -23.1, longitude: -49.1, order: 1 },
      { id: '2', latitude: -23.2, longitude: -49.2, order: 2 },
    ]);

    expect(result.map((point) => point.id)).toEqual(['1', '2', '3']);
  });

  it('should drop points with invalid coordinates or order values', () => {
    const result = normalizeOrderedBoundaryPoints([
      { id: 'valid', latitude: -23.1, longitude: -49.1, order: 1 },
      { id: 'bad-lat', latitude: Number.NaN, longitude: -49.2, order: 2 },
      { id: 'bad-lng', latitude: -23.3, longitude: null, order: 3 },
      { id: 'bad-order', latitude: -23.4, longitude: -49.4, order: null },
    ]);

    expect(result).toEqual([
      { id: 'valid', latitude: -23.1, longitude: -49.1, order: 1 },
    ]);
  });

  it('should build a closed GeoJSON polygon and Leaflet lat-lng tuples', () => {
    const boundary = buildOrderedMapBoundary([
      { latitude: 2, longitude: 20, order: 2 },
      { latitude: 1, longitude: 10, order: 1 },
      { latitude: 3, longitude: 30, order: 3 },
    ]);

    expect(boundary?.latLngs).toEqual([
      [1, 10],
      [2, 20],
      [3, 30],
    ]);
    expect(boundary?.geoJson.coordinates[0]).toEqual([
      [10, 1],
      [20, 2],
      [30, 3],
      [10, 1],
    ]);
  });

  it('should return null when fewer than three valid points remain', () => {
    const boundary = buildOrderedMapBoundary([
      { latitude: 1, longitude: 10, order: 1 },
      { latitude: 2, longitude: 20, order: 2 },
      { latitude: null, longitude: 30, order: 3 },
    ]);

    expect(boundary).toBeNull();
  });
});
