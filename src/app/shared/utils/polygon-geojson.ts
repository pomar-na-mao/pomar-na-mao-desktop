import type { GeoJsonPolygon, MassInclusionCoordinate } from '../../domain/models/mass-inclusion';

export function toClosedGeoJsonPolygon(coordinates: MassInclusionCoordinate[]): GeoJsonPolygon {
  if (coordinates.length < 3) {
    throw new Error('A polygon needs at least 3 coordinates.');
  }

  if (!coordinates.every((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng))) {
    throw new Error('Polygon coordinates must be finite numbers.');
  }

  const ring = coordinates.map((coordinate) => [coordinate.lng, coordinate.lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([...first]);
  }

  return {
    type: 'Polygon',
    coordinates: [ring],
  };
}
