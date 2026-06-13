insert into public.operation_types (
  code,
  name,
  category,
  requires_track,
  affects_plants,
  can_generate_occurrences
)
values (
  'polygon_bulk_update',
  'Inserção em massa',
  'bulk_update',
  false,
  true,
  true
)
on conflict (code) do update set
  name = excluded.name,
  category = excluded.category,
  requires_track = excluded.requires_track,
  affects_plants = excluded.affects_plants,
  can_generate_occurrences = excluded.can_generate_occurrences;

create table if not exists public.field_operation_areas (
  id uuid primary key default gen_random_uuid(),
  field_operation_id uuid not null references public.field_operations(id) on delete cascade,
  area extensions.geography(polygon, 4326) not null,
  area_geojson jsonb,
  plants_found_count integer not null default 0,
  plants_changed_count integer not null default 0,
  local_id text,
  device_id text,
  sync_status text not null default 'synced',
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  constraint uq_field_operation_areas_operation unique (field_operation_id)
);

create index if not exists idx_field_operation_areas_area
  on public.field_operation_areas using gist (area);

create index if not exists idx_field_operation_areas_operation
  on public.field_operation_areas (field_operation_id);

create table if not exists public.plant_attribute_change_history (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  field_operation_id uuid not null references public.field_operations(id) on delete cascade,
  attribute_name text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now(),
  notes text,
  local_id text,
  device_id text,
  sync_status text not null default 'synced',
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  constraint chk_plant_attribute_change_name
    check (attribute_name in ('variety_id', 'planting_date', 'life_of_the_tree'))
);

create index if not exists idx_plant_attribute_change_history_plant
  on public.plant_attribute_change_history (plant_id);

create index if not exists idx_plant_attribute_change_history_operation
  on public.plant_attribute_change_history (field_operation_id);

create index if not exists idx_plant_attribute_change_history_attribute
  on public.plant_attribute_change_history (attribute_name);

create index if not exists idx_plant_attribute_change_history_changed_at
  on public.plant_attribute_change_history (changed_at);

alter table public.field_operation_areas enable row level security;
alter table public.plant_attribute_change_history enable row level security;

do $$
declare
  table_name text;
  tables text[] := array[
    'field_operation_areas',
    'plant_attribute_change_history'
  ];
begin
  foreach table_name in array tables loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'Authenticated users can read ' || table_name
    ) then
      execute format(
        'create policy %I on public.%I for select to authenticated using (true)',
        'Authenticated users can read ' || table_name,
        table_name
      );
    end if;

  end loop;
end $$;

revoke all on public.field_operation_areas from public, anon;
revoke all on public.plant_attribute_change_history from public, anon;
grant select on public.field_operation_areas to authenticated;
grant select on public.plant_attribute_change_history to authenticated;

alter table public.plant_occurrences
  drop constraint if exists chk_plant_occurrences_assignment_method;

alter table public.plant_occurrences
  add constraint chk_plant_occurrences_assignment_method
  check (assignment_method in ('manual', 'nearest_plant', 'corrected_by_user', 'polygon_bulk'));

create or replace function public.find_plants_inside_polygon(
  p_polygon_geojson jsonb
)
returns table (
  plant_id uuid,
  latitude double precision,
  longitude double precision,
  zone_id uuid,
  zone_name text,
  variety_id bigint,
  variety_name text,
  planting_date timestamptz
)
language plpgsql
stable
security invoker
set search_path = public, extensions
as $$
declare
  v_polygon jsonb;
  v_geom extensions.geometry;
begin
  v_polygon := case
    when p_polygon_geojson->>'type' = 'Feature' then p_polygon_geojson->'geometry'
    else p_polygon_geojson
  end;

  v_geom := extensions.st_setsrid(
    extensions.st_geomfromgeojson(v_polygon::text),
    4326
  );

  return query
  select
    p.id as plant_id,
    p.latitude,
    p.longitude,
    p.zone_id,
    z.name as zone_name,
    p.variety_id,
    v.name as variety_name,
    p.planting_date
  from public.plants p
  left join public.zones z on z.id = p.zone_id
  left join public.varieties v on v.id = p.variety_id
  where p.non_existent = false
    and extensions.st_contains(v_geom, p.location::extensions.geometry)
  order by p.id;
end;
$$;

create or replace function public.sync_polygon_bulk_update(
  p_payload jsonb
)
returns table (
  field_operation_id uuid,
  plants_changed_count integer,
  occurrences_created_count integer,
  occurrences_updated_count integer,
  attributes_updated_count integer
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_operation_type_id uuid;
  v_field_operation_id uuid;
  v_area extensions.geography(polygon, 4326);
  v_polygon jsonb;
  v_device_id text;
  v_local_id text;
  v_started_at timestamptz;
  v_finished_at timestamptz;
  v_notes text;
  v_plant jsonb;
  v_occurrence jsonb;
  v_plant_id uuid;
  v_history_id uuid;
  v_existing_occurrence_id uuid;
  v_new_variety_id bigint;
  v_new_planting_date timestamptz;
  v_new_life_of_the_tree text;
  v_old_variety_id bigint;
  v_old_planting_date timestamptz;
  v_old_life_of_the_tree text;
  v_plants_count integer;
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_attributes_count integer := 0;
begin
  v_plants_count := jsonb_array_length(coalesce(p_payload->'plants', '[]'::jsonb));
  v_new_variety_id := nullif(p_payload->>'varietyId', '')::bigint;
  v_new_planting_date := nullif(p_payload->>'plantingDate', '')::timestamptz;
  v_new_life_of_the_tree := nullif(p_payload->>'lifeOfTree', '');

  if v_plants_count = 0 then
    raise exception 'Nenhuma planta selecionada para inclusão em massa';
  end if;

  if jsonb_array_length(coalesce(p_payload->'occurrences', '[]'::jsonb)) = 0
    and v_new_variety_id is null
    and v_new_planting_date is null
    and v_new_life_of_the_tree is null then
    raise exception 'Nenhuma alteração selecionada para inclusão em massa';
  end if;

  v_polygon := case
    when (p_payload->'polygonGeojson')->>'type' = 'Feature' then p_payload->'polygonGeojson'->'geometry'
    else p_payload->'polygonGeojson'
  end;

  if v_polygon is null then
    raise exception 'Polígono GeoJSON é obrigatório';
  end if;

  v_area := extensions.st_setsrid(
    extensions.st_geomfromgeojson(v_polygon::text),
    4326
  )::extensions.geography;

  v_device_id := nullif(p_payload->>'deviceId', '');
  v_local_id := nullif(p_payload->>'localOperationId', '');
  v_started_at := nullif(p_payload->>'startedAt', '')::timestamptz;
  v_finished_at := nullif(p_payload->>'finishedAt', '')::timestamptz;
  v_notes := nullif(p_payload->>'notes', '');

  select id
  into v_operation_type_id
  from public.operation_types
  where code = 'polygon_bulk_update';

  if v_operation_type_id is null then
    raise exception 'operation_types.code polygon_bulk_update não encontrado';
  end if;

  insert into public.field_operations (
    operation_type_id,
    source,
    title,
    started_at,
    finished_at,
    notes,
    local_id,
    device_id,
    sync_status,
    synced_at
  )
  values (
    v_operation_type_id,
    'manual',
    'Inserção em massa',
    coalesce(v_started_at, now()),
    coalesce(v_finished_at, now()),
    v_notes,
    v_local_id,
    v_device_id,
    'synced',
    now()
  )
  returning id into v_field_operation_id;

  insert into public.field_operation_areas (
    field_operation_id,
    area,
    area_geojson,
    plants_found_count,
    plants_changed_count,
    local_id,
    device_id,
    sync_status,
    synced_at
  )
  values (
    v_field_operation_id,
    v_area,
    v_polygon,
    coalesce((p_payload->>'plantsFoundCount')::integer, v_plants_count),
    v_plants_count,
    v_local_id,
    v_device_id,
    'synced',
    now()
  );

  for v_plant in
    select * from jsonb_array_elements(coalesce(p_payload->'plants', '[]'::jsonb))
  loop
    v_plant_id := (v_plant->>'plantId')::uuid;

    insert into public.plant_operation_history (
      plant_id,
      field_operation_id,
      operation_type_id,
      matched_at,
      match_source,
      status,
      notes,
      local_id,
      device_id,
      sync_status,
      synced_at
    )
    values (
      v_plant_id,
      v_field_operation_id,
      v_operation_type_id,
      now(),
      coalesce(nullif(v_plant->>'selectionSource', ''), 'polygon_selected'),
      'confirmed',
      v_notes,
      v_local_id,
      v_device_id,
      'synced',
      now()
    )
    on conflict on constraint uq_plant_operation do update set
      matched_at = excluded.matched_at,
      match_source = excluded.match_source,
      status = excluded.status,
      notes = excluded.notes,
      synced_at = excluded.synced_at
    returning id into v_history_id;

    for v_occurrence in
      select * from jsonb_array_elements(coalesce(p_payload->'occurrences', '[]'::jsonb))
    loop
      v_existing_occurrence_id := null;

      select po.id
      into v_existing_occurrence_id
      from public.plant_occurrences po
      where po.plant_id = v_plant_id
        and po.occurrence_type_id = (v_occurrence->>'occurrenceTypeId')::uuid
        and po.status = 'open'
      order by po.observed_at desc
      limit 1;

      if v_existing_occurrence_id is null then
        insert into public.plant_occurrences (
          plant_id,
          occurrence_type_id,
          field_operation_id,
          plant_operation_history_id,
          observed_at,
          severity,
          status,
          notes,
          assignment_method,
          assignment_status,
          local_id,
          device_id,
          sync_status,
          synced_at
        )
        values (
          v_plant_id,
          (v_occurrence->>'occurrenceTypeId')::uuid,
          v_field_operation_id,
          v_history_id,
          now(),
          nullif(v_occurrence->>'severity', ''),
          'open',
          nullif(v_occurrence->>'notes', ''),
          'polygon_bulk',
          'confirmed',
          v_local_id,
          v_device_id,
          'synced',
          now()
        );

        v_created_count := v_created_count + 1;
      else
        update public.plant_occurrences
        set
          field_operation_id = v_field_operation_id,
          plant_operation_history_id = v_history_id,
          severity = coalesce(nullif(v_occurrence->>'severity', ''), severity),
          notes = coalesce(nullif(v_occurrence->>'notes', ''), notes),
          assignment_method = 'polygon_bulk',
          assignment_status = 'confirmed',
          updated_at = now(),
          sync_status = 'synced',
          synced_at = now()
        where id = v_existing_occurrence_id;

        v_updated_count := v_updated_count + 1;
      end if;
    end loop;

    if v_new_variety_id is not null or v_new_planting_date is not null or v_new_life_of_the_tree is not null then
      select p.variety_id, p.planting_date, p.life_of_the_tree
      into v_old_variety_id, v_old_planting_date, v_old_life_of_the_tree
      from public.plants p
      where p.id = v_plant_id
      for update;

      if v_new_variety_id is not null and v_old_variety_id is distinct from v_new_variety_id then
        insert into public.plant_attribute_change_history (
          plant_id,
          field_operation_id,
          attribute_name,
          old_value,
          new_value,
          notes,
          local_id,
          device_id,
          sync_status,
          synced_at
        )
        values (
          v_plant_id,
          v_field_operation_id,
          'variety_id',
          v_old_variety_id::text,
          v_new_variety_id::text,
          v_notes,
          v_local_id,
          v_device_id,
          'synced',
          now()
        );

        update public.plants
        set variety_id = v_new_variety_id,
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
        where id = v_plant_id;

        v_attributes_count := v_attributes_count + 1;
      end if;

      if v_new_planting_date is not null and v_old_planting_date is distinct from v_new_planting_date then
        insert into public.plant_attribute_change_history (
          plant_id,
          field_operation_id,
          attribute_name,
          old_value,
          new_value,
          notes,
          local_id,
          device_id,
          sync_status,
          synced_at
        )
        values (
          v_plant_id,
          v_field_operation_id,
          'planting_date',
          v_old_planting_date::text,
          v_new_planting_date::text,
          v_notes,
          v_local_id,
          v_device_id,
          'synced',
          now()
        );

        update public.plants
        set planting_date = v_new_planting_date,
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
        where id = v_plant_id;

        v_attributes_count := v_attributes_count + 1;
      end if;

      if v_new_life_of_the_tree is not null and v_old_life_of_the_tree is distinct from v_new_life_of_the_tree then
        insert into public.plant_attribute_change_history (
          plant_id,
          field_operation_id,
          attribute_name,
          old_value,
          new_value,
          notes,
          local_id,
          device_id,
          sync_status,
          synced_at
        )
        values (
          v_plant_id,
          v_field_operation_id,
          'life_of_the_tree',
          v_old_life_of_the_tree,
          v_new_life_of_the_tree,
          v_notes,
          v_local_id,
          v_device_id,
          'synced',
          now()
        );

        update public.plants
        set life_of_the_tree = v_new_life_of_the_tree,
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
        where id = v_plant_id;

        v_attributes_count := v_attributes_count + 1;
      end if;
    end if;
  end loop;

  return query
  select
    v_field_operation_id,
    v_plants_count,
    v_created_count,
    v_updated_count,
    v_attributes_count;
end;
$$;

revoke all on function public.find_plants_inside_polygon(jsonb) from public, anon;
revoke all on function public.sync_polygon_bulk_update(jsonb) from public, anon;
grant execute on function public.find_plants_inside_polygon(jsonb) to authenticated;
grant execute on function public.sync_polygon_bulk_update(jsonb) to authenticated;
