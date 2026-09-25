drop function if exists public.get_zone_regions(uuid);

create or replace function public.get_zone_regions(p_zone_id text)
returns table(
  id uuid,
  latitude double precision,
  longitude double precision,
  "order" numeric,
  region text,
  zone_id uuid
)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    r.id,
    r.latitude,
    r.longitude,
    r."order",
    r.region,
    r.zone_id
  from public.regions r
  where r.zone_id = p_zone_id::uuid
  order by r."order" asc;
$function$;

revoke all on function public.get_zone_regions(text) from public;
grant execute on function public.get_zone_regions(text) to anon;
grant execute on function public.get_zone_regions(text) to authenticated;
grant execute on function public.get_zone_regions(text) to service_role;

select pg_notify('pgrst', 'reload schema');
