-- Migration to allow 'bulk_upload' as source in field_operations and update sync_polygon_bulk_update to save zone_id and source.

-- 1. Update check constraint on field_operations
alter table public.field_operations drop constraint if exists chk_field_operations_source;
alter table public.field_operations add constraint chk_field_operations_source check (source in ('manual', 'inspection', 'gps_track', 'imported', 'automatic', 'bulk_upload'));

-- 2. Update sync_polygon_bulk_update RPC
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
  v_occurrence_action text;
  v_plant jsonb;
  v_occurrence jsonb;
  v_plant_id uuid;
  v_history_id uuid;
  v_existing_occurrence_id uuid;
  v_resolved_count integer;
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
  v_zone_id uuid;
begin
  v_plants_count := jsonb_array_length(coalesce(p_payload->'plants', '[]'::jsonb));
  v_new_variety_id := nullif(p_payload->>'varietyId', '')::bigint;
  v_new_planting_date := nullif(p_payload->>'plantingDate', '')::timestamptz;
  v_new_life_of_the_tree := nullif(p_payload->>'lifeOfTree', '');
  v_occurrence_action := coalesce(nullif(p_payload->>'occurrenceAction', ''), 'add');

  if v_occurrence_action not in ('add', 'remove') then
    v_occurrence_action := 'add';
  end if;

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
  v_zone_id := nullif(p_payload->>'zoneId', '')::uuid;

  select id
  into v_operation_type_id
  from public.operation_types
  where code = 'polygon_bulk_update';

  if v_operation_type_id is null then
    raise exception 'operation_types.code polygon_bulk_update não encontrado';
  end if;

  insert into public.field_operations (
    operation_type_id,
    zone_id,
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
    v_zone_id,
    'bulk_upload',
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
      if v_occurrence_action = 'remove' then
        update public.plant_occurrences po
        set
          field_operation_id = v_field_operation_id,
          plant_operation_history_id = v_history_id,
          status = 'resolved',
          resolved_at = coalesce(po.resolved_at, now()),
          notes = coalesce(nullif(v_occurrence->>'notes', ''), po.notes),
          assignment_method = 'polygon_bulk',
          assignment_status = 'confirmed',
          updated_at = now(),
          sync_status = 'synced',
          synced_at = now()
        where po.plant_id = v_plant_id
          and po.occurrence_type_id = (v_occurrence->>'occurrenceTypeId')::uuid
          and po.status = 'open';

        get diagnostics v_resolved_count = row_count;
        v_updated_count := v_updated_count + v_resolved_count;
      else
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

revoke all on function public.sync_polygon_bulk_update(jsonb) from public, anon;
grant execute on function public.sync_polygon_bulk_update(jsonb) to authenticated;
