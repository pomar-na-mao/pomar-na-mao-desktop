export interface OrderedMapBoundaryPoint {
  id?: string | null;
  latitude: number | null;
  longitude: number | null;
  order?: number | null;
}

export interface NormalizedOrderedMapBoundaryPoint {
  id?: string | null;
  latitude: number;
  longitude: number;
  order: number;
}

export interface OrderedMapBoundary {
  points: NormalizedOrderedMapBoundaryPoint[];
  latLngs: [number, number][];
  geoJson: GeoJSON.Polygon;
}

export function normalizeOrderedBoundaryPoints(
  points: OrderedMapBoundaryPoint[] | null | undefined,
): NormalizedOrderedMapBoundaryPoint[] {
  if (!Array.isArray(points)) {
    return [];
  }

  return points
    .map((point) => ({
      id: point.id,
      latitude: toFiniteNumber(point.latitude),
      longitude: toFiniteNumber(point.longitude),
      order: toFiniteNumber(point.order),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.latitude) &&
        Number.isFinite(point.longitude) &&
        Number.isFinite(point.order),
    )
    .sort((left, right) => left.order - right.order);
}

export function buildOrderedMapBoundary(
  points: OrderedMapBoundaryPoint[] | null | undefined,
): OrderedMapBoundary | null {
  const normalizedPoints = normalizeOrderedBoundaryPoints(points);

  if (normalizedPoints.length < 3) {
    return null;
  }

  const coordinates = normalizedPoints.map(
    (point) => [point.longitude, point.latitude] as [number, number],
  );
  const firstCoordinate = coordinates[0];
  const lastCoordinate = coordinates[coordinates.length - 1];

  const closedCoordinates =
    firstCoordinate[0] === lastCoordinate[0] &&
    firstCoordinate[1] === lastCoordinate[1]
      ? coordinates
      : [...coordinates, firstCoordinate];

  return {
    points: normalizedPoints,
    latLngs: normalizedPoints.map(
      (point) => [point.latitude, point.longitude] as [number, number],
    ),
    geoJson: {
      type: 'Polygon',
      coordinates: [closedCoordinates],
    },
  };
}

function toFiniteNumber(value: number | null | undefined): number {
  if (value == null) {
    return Number.NaN;
  }

  return Number(value);
}
