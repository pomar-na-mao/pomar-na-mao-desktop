import type { MachineItem } from './machine.model';
import type { MixtureItem } from './mixture.model';
import type { PlantMapItem } from './plant-data.model';

export type ActivityGeometryType = 'route' | 'area';
export type ActivityCoordinate = [longitude: number, latitude: number];

export interface ActivityMapZone {
  id: string;
  name: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
}

export interface ActivityFormCatalogs {
  machines: MachineItem[];
  mixtures: MixtureItem[];
  boundary: Array<{ latitude: number; longitude: number }>;
  zones: ActivityMapZone[];
  plants: PlantMapItem[];
}

export interface ActivityEntryDraft {
  geometryType: ActivityGeometryType;
  coordinates: ActivityCoordinate[];
  activity: string;
  performedAt: string;
  responsible: string;
  mixtureId?: string;
  machineId?: string;
}

export interface ActivitySyncResult {
  local_id: string;
  field_operation_id: string;
  entry_id: string;
  inputs_count: number;
  synced_at: string;
}

export interface ActivitySyncPayload {
  deviceId: string;
  entries: Array<{
    localId: string;
    geometryType: ActivityGeometryType;
    geometry:
      | { type: 'LineString'; coordinates: ActivityCoordinate[] }
      | { type: 'Polygon'; coordinates: ActivityCoordinate[][] };
    activity: string;
    performedAt: string;
    responsible: string;
    mixtureId?: string;
    machineId?: string;
    inputs: [];
  }>;
}

export function validateActivityGeometry(
  type: ActivityGeometryType,
  coordinates: ActivityCoordinate[],
): string | null {
  const minimum = type === 'route' ? 2 : 3;
  const distinctCoordinates = new Set(
    coordinates.map(([longitude, latitude]) => `${longitude}:${latitude}`),
  );
  if (coordinates.length < minimum || distinctCoordinates.size < minimum) {
    return type === 'route'
      ? 'Desenhe uma rota com pelo menos dois pontos.'
      : 'Desenhe uma área com pelo menos três pontos.';
  }
  if (coordinates.length > 2000) {
    return 'A geometria não pode ultrapassar 2.000 pontos.';
  }
  if (
    coordinates.some(
      ([longitude, latitude]) =>
        !Number.isFinite(longitude) ||
        !Number.isFinite(latitude) ||
        longitude < -180 ||
        longitude > 180 ||
        latitude < -90 ||
        latitude > 90,
    )
  ) {
    return 'A geometria possui coordenadas inválidas.';
  }
  return null;
}

export function buildActivityGeometry(
  type: ActivityGeometryType,
  coordinates: ActivityCoordinate[],
): ActivitySyncPayload['entries'][number]['geometry'] {
  if (type === 'route') {
    return { type: 'LineString', coordinates };
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const closed =
    first[0] === last[0] && first[1] === last[1]
      ? coordinates
      : [...coordinates, first];
  return { type: 'Polygon', coordinates: [closed] };
}
