drop function if exists public.get_spraying_operations(timestamptz, timestamptz, uuid);
drop function if exists public.get_spraying_operations(date, date, uuid);

create or replace function public.get_spraying_operations(
  p_start_date date default null,
  p_end_date date default null,
  p_zone_id uuid default null
)
returns table (
  operation_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  operator_name text,
  machine_name text,
  notes text,
  route_geojson jsonb,
  inputs jsonb,
  track_points_count integer
)
language sql security definer set search_path = '' as $$
  select
    fo.id as operation_id,
    fo.started_at,
    fo.finished_at,
    fo.operator_name,
    fo.machine_name,
    fo.notes,
    extensions.st_asgeojson(foroutes.route)::jsonb as route_geojson,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'product_name', oi.product_name,
          'dose', oi.dose,
          'dose_unit', oi.dose_unit
        ))
        from public.operation_inputs oi
        where oi.field_operation_id = fo.id
      ),
      '[]'::jsonb
    ) as inputs,
    (
      select count(*)::integer
      from public.field_operation_track_points fotp
      where fotp.field_operation_id = fo.id
    ) as track_points_count
  from public.field_operations fo
  join public.field_operation_routes foroutes on foroutes.field_operation_id = fo.id
  where fo.source = 'gps_track'
    and (p_start_date is null or (fo.created_at at time zone 'America/Sao_Paulo')::date >= p_start_date)
    and (p_end_date is null or (fo.created_at at time zone 'America/Sao_Paulo')::date <= p_end_date)
    and (p_zone_id is null or fo.zone_id = p_zone_id);
$$;

revoke all on function public.get_spraying_operations(date, date, uuid) from public, anon;
grant execute on function public.get_spraying_operations(date, date, uuid) to authenticated;
