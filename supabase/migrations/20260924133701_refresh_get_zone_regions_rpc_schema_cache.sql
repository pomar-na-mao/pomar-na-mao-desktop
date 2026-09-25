create or replace function public.get_zone_regions(p_zone_id uuid)
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
  where r.zone_id = p_zone_id
  order by r."order" asc;
$function$;

revoke all on function public.get_zone_regions(uuid) from public;
grant execute on function public.get_zone_regions(uuid) to anon;
grant execute on function public.get_zone_regions(uuid) to authenticated;
grant execute on function public.get_zone_regions(uuid) to service_role;

notify pgrst, 'reload schema';
