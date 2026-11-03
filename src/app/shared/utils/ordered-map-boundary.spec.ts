import { describe, expect, it } from 'vitest';
import {
  buildOrderedMapBoundary,
  isValidMapCoordinate,
  normalizeFarmBoundaryCandidate,
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

  it('should validate coordinate ranges and finite values', () => {
    expect(isValidMapCoordinate(-90, -180)).toBe(true);
    expect(isValidMapCoordinate(90, 180)).toBe(true);
    expect(isValidMapCoordinate(91, 0)).toBe(false);
    expect(isValidMapCoordinate(0, -181)).toBe(false);
    expect(isValidMapCoordinate(Number.NaN, 0)).toBe(false);
  });

  it('should normalize a candidate without changing its marking order', () => {
    const result = normalizeFarmBoundaryCandidate([
      { lat: -23.3, lng: -49.3 },
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
    ]);

    expect(result).toEqual([
      { latitude: -23.3, longitude: -49.3 },
      { latitude: -23.1, longitude: -49.1 },
      { latitude: -23.2, longitude: -49.2 },
    ]);
  });

  it('should reject candidates with fewer than three distinct valid points', () => {
    expect(
      normalizeFarmBoundaryCandidate([
        { lat: -23.1, lng: -49.1 },
        { lat: -23.1, lng: -49.1 },
        { lat: -23.2, lng: -49.2 },
      ]),
    ).toBeNull();
    expect(
      normalizeFarmBoundaryCandidate([
        { lat: -91, lng: -49.1 },
        { lat: -23.2, lng: -49.2 },
        { lat: -23.3, lng: -49.3 },
      ]),
    ).toBeNull();
  });
});
