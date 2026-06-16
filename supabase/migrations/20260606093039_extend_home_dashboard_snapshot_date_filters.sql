drop function if exists public.get_home_dashboard_snapshot();

create or replace function public.get_home_dashboard_snapshot(
  p_period_start_date date default null,
  p_period_end_date date default null,
  p_planting_start_date date default null,
  p_planting_end_date date default null,
  p_operation_code text default null
)
returns jsonb
language sql
stable
security invoker
set search_path = public, extensions
as $$
  with filtered_plants as (
    select
      p.id,
      p.latitude,
      p.longitude,
      p.variety_id,
      v.name as variety_name
    from public.plants p
    left join public.varieties v
      on v.id = p.variety_id
    where p.non_existent = false
      and p.latitude is not null
      and p.longitude is not null
      and (
        (p_planting_start_date is null and p_planting_end_date is null)
        or (
          p.planting_date is not null
          and (p_planting_start_date is null or p.planting_date::date >= p_planting_start_date)
          and (p_planting_end_date is null or p.planting_date::date <= p_planting_end_date)
        )
      )
      and (
        p_operation_code is null
        or (p_period_start_date is null and p_period_end_date is null)
        or (
          case
            when p_operation_code = 'annotation' then exists (
              select 1
              from public.plant_occurrences po
              left join public.field_operations fo
                on fo.id = po.field_operation_id
              left join public.operation_types ot
                on ot.id = fo.operation_type_id
              where po.plant_id = p.id
                and coalesce(ot.code, 'annotation') in ('annotation', 'occurrence_annotation')
                and (p_period_start_date is null or (po.observed_at at time zone 'America/Sao_Paulo')::date >= p_period_start_date)
                and (p_period_end_date is null or (po.observed_at at time zone 'America/Sao_Paulo')::date <= p_period_end_date)
            )
            else exists (
              select 1
              from public.plant_operation_history poh
              join public.field_operations fo
                on fo.id = poh.field_operation_id
              join public.operation_types ot
                on ot.id = fo.operation_type_id
              where poh.plant_id = p.id
                and ot.code = p_operation_code
                and (
                  p_period_start_date is null
                  or (coalesce(poh.matched_at, fo.finished_at, fo.started_at) at time zone 'America/Sao_Paulo')::date >= p_period_start_date
                )
                and (
                  p_period_end_date is null
                  or (coalesce(poh.matched_at, fo.finished_at, fo.started_at) at time zone 'America/Sao_Paulo')::date <= p_period_end_date
                )
            )
          end
        )
      )
  )
  select jsonb_build_object(
    'summary',
    jsonb_build_object(
      'totalPlants',
      (
        select count(*)::integer
        from public.plants
      ),
      'totalZones',
      (
        select count(*)::integer
        from public.zones
      ),
      'totalOccurrenceTypes',
      (
        select count(*)::integer
        from public.occurrence_types
      ),
      'totalVarieties',
      (
        select count(*)::integer
        from public.varieties
      ),
      'varieties',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', v.id,
              'name', v.name
            )
            order by v.name
          )
          from public.varieties v
        ),
        '[]'::jsonb
      )
    ),
    'plants',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', fp.id,
            'latitude', fp.latitude,
            'longitude', fp.longitude,
            'varietyId', fp.variety_id,
            'varietyName', fp.variety_name
          )
          order by fp.id
        )
        from filtered_plants fp
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.get_home_dashboard_snapshot(date, date, date, date, text) from public;
grant execute on function public.get_home_dashboard_snapshot(date, date, date, date, text) to authenticated;
