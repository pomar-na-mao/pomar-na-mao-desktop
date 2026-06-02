create or replace function public.get_home_dashboard_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = public, extensions
as $$
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
            'id', p.id,
            'latitude', p.latitude,
            'longitude', p.longitude,
            'varietyId', p.variety_id,
            'varietyName', v.name
          )
          order by p.id
        )
        from public.plants p
        left join public.varieties v
          on v.id = p.variety_id
        where p.non_existent = false
          and p.latitude is not null
          and p.longitude is not null
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.get_home_dashboard_snapshot() from public;
grant execute on function public.get_home_dashboard_snapshot() to authenticated;
