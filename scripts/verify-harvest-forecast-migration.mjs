import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  'supabase/migrations/20261120120000_add_harvest_forecast_desktop_query.sql',
);
const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

const requiredFragments = [
  'public.get_harvest_forecasts(',
  'p_start_date date',
  'p_end_date date',
  'p_classifications text[]',
  'p_zone_id uuid',
  'forecast_id uuid',
  'plant_id uuid',
  'zone_id uuid',
  'classification text',
  'collected_at timestamptz',
  'latitude double precision',
  'longitude double precision',
  "not in ('n', 'p', 'm', 'g', 'gg')",
  'security definer',
  "set search_path = ''",
  'from public, anon',
  'to authenticated, service_role',
  "notify pgrst, 'reload schema'",
];

for (const fragment of requiredFragments) {
  if (!sql.includes(fragment)) {
    throw new Error(`Migration contract is missing: ${fragment}`);
  }
}

if ((sql.match(/america\/sao_paulo/g) ?? []).length !== 2) {
  throw new Error('Migration must apply Sao Paulo timezone to both date boundaries.');
}

const forbiddenPatterns = [
  /insert\s+into\s+public\.harvest_forecasts/,
  /update\s+public\.harvest_forecasts/,
  /delete\s+from\s+public\.harvest_forecasts/,
  /create or replace function public\.sync_harvest_forecasts/,
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(sql)) {
    throw new Error(`Read migration contains forbidden mutation: ${pattern}`);
  }
}

console.log('Harvest forecast migration contract verified.');
