begin;

alter table public.regions
  alter column zone_id drop default;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'regions_zone_id_fkey'
      and conrelid = 'public.regions'::regclass
  ) then
    alter table public.regions
      add constraint regions_zone_id_fkey
      foreign key (zone_id)
      references public.zones(id)
      on update cascade
      on delete cascade
      not valid;
  end if;
end $$;

create index if not exists idx_regions_zone_id
  on public.regions using btree (zone_id);

create or replace function public.create_zone_with_regions(
  p_name text,
  p_code text default null,
  p_description text default null,
  p_polygon_geojson jsonb default null,
  p_points jsonb default null
)
returns table (
  zone_id uuid,
  zone_name text,
  region_points_count integer,
  polygon jsonb
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_code text := nullif(trim(coalesce(p_code, '')), '');
  v_description text := nullif(trim(coalesce(p_description, '')), '');
  v_points_count integer;
  v_zone_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuario autenticado e obrigatorio para criar zona.'
      using errcode = '42501';
  end if;

  if v_name = '' then
    raise exception 'Nome da zona e obrigatorio.'
      using errcode = '22023';
  end if;

  if p_polygon_geojson is null
    or p_polygon_geojson->>'type' <> 'Polygon'
    or jsonb_typeof(p_polygon_geojson->'coordinates') <> 'array'
  then
    raise exception 'Poligono GeoJSON invalido.'
      using errcode = '22023';
  end if;

  if p_points is null or jsonb_typeof(p_points) <> 'array' then
    raise exception 'Pontos do poligono invalidos.'
      using errcode = '22023';
  end if;

  select count(*) into v_points_count
  from jsonb_array_elements(p_points) as point
  where jsonb_typeof(point) = 'object'
    and jsonb_typeof(point->'latitude') = 'number'
    and jsonb_typeof(point->'longitude') = 'number'
    and (point->>'latitude')::double precision between -90 and 90
    and (point->>'longitude')::double precision between -180 and 180;

  if v_points_count < 3 or v_points_count <> jsonb_array_length(p_points) then
    raise exception 'Poligono deve conter ao menos tres vertices validos.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.zones z
    where lower(trim(z.name)) = lower(v_name)
  ) then
    raise exception 'Ja existe uma zona com este nome.'
      using errcode = '23505';
  end if;

  insert into public.zones (
    name,
    code,
    description,
    polygon,
    boundary,
    sync_status,
    synced_at
  )
  values (
    v_name,
    v_code,
    v_description,
    p_polygon_geojson,
    extensions.st_setsrid(
      extensions.st_geomfromgeojson(p_polygon_geojson::text),
      4326
    )::extensions.geography,
    'synced',
    now()
  )
  returning id into v_zone_id;

  insert into public.regions (
    longitude,
    latitude,
    region,
    zone_id
  )
  select
    (point->>'longitude')::double precision,
    (point->>'latitude')::double precision,
    v_name,
    v_zone_id
  from jsonb_array_elements(p_points) as point;

  return query
  select v_zone_id, v_name, v_points_count, p_polygon_geojson;
end;
$$;

revoke all on function public.create_zone_with_regions(text, text, text, jsonb, jsonb) from public;
grant execute on function public.create_zone_with_regions(text, text, text, jsonb, jsonb) to authenticated;

grant select on table public.zones to anon, authenticated;
grant select on table public.regions to anon, authenticated;
grant insert on table public.zones to authenticated;
grant insert on table public.regions to authenticated;

commit;
