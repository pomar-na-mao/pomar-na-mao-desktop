-- Returns all open occurrences as a single jsonb array.
-- Using jsonb return instead of TABLE to bypass PostgREST's default row limit
-- (which would silently truncate results to 1000 rows).
create or replace function public.get_open_occurrences()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'plant_id', po.plant_id,
        'occurrence_type_id', po.occurrence_type_id
      )
    ),
    '[]'::jsonb
  )
  from public.plant_occurrences po
  where po.status = 'open';
$$;

revoke all on function public.get_open_occurrences() from public, anon;
grant execute on function public.get_open_occurrences() to authenticated;
