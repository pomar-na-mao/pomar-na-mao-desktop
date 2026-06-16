drop function if exists public.get_inspection_operations(date, date, uuid);

create or replace function public.get_inspection_operations(
  p_start_date date default null,
  p_end_date date default null,
  p_zone_id uuid default null
)
returns table (
  operation_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  zone_name text,
  plants jsonb
)
language sql security definer set search_path = '' as $$
  select
    fo.id as operation_id,
    fo.started_at,
    fo.finished_at,
    fo.notes,
    z.name as zone_name,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'plant_id', p.id,
          'latitude', p.latitude,
          'longitude', p.longitude,
          'occurrences', coalesce(
            (
              select jsonb_agg(jsonb_build_object(
                'occurrence_id', poe.occurrence_id,
                'occurrence_type_name', ot.name,
                'status', case when poe.action = 'added' then 'open' else 'removed' end,
                'severity', coalesce(po.severity, poe.new_value->>'severity', poe.previous_value->>'severity'),
                'notes', coalesce(po.notes, poe.new_value->>'notes', poe.previous_value->>'notes'),
                'resolved_at', coalesce(po.resolved_at, (poe.new_value->>'resolvedAt')::timestamptz)
              ))
              from public.plant_occurrence_events poe
              join public.occurrence_types ot on ot.id = poe.occurrence_type_id
              left join public.plant_occurrences po on po.id = poe.occurrence_id
              where poe.plant_id = p.id
                and poe.field_operation_id = fo.id
                and poe.action in ('added', 'removed')
            ),
            '[]'::jsonb
          )
        ))
        from public.plant_operation_history poh
        join public.plants p on p.id = poh.plant_id
        where poh.field_operation_id = fo.id
      ),
      '[]'::jsonb
    ) as plants
  from public.field_operations fo
  left join public.zones z on z.id = fo.zone_id
  where fo.source = 'inspection'
    and (p_start_date is null or (fo.created_at at time zone 'America/Sao_Paulo')::date >= p_start_date)
    and (p_end_date is null or (fo.created_at at time zone 'America/Sao_Paulo')::date <= p_end_date)
    and (p_zone_id is null or fo.zone_id = p_zone_id);
$$;

revoke all on function public.get_inspection_operations(date, date, uuid) from public, anon;
grant execute on function public.get_inspection_operations(date, date, uuid) to authenticated;
