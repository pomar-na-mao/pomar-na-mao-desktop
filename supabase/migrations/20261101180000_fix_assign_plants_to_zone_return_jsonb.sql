-- ============================================================================
-- Migration: 20261101180000_fix_assign_plants_to_zone_return_jsonb.sql
-- Descrição: Atualiza a RPC assign_plants_to_zone para retornar jsonb contendo
--            zone_id, zone_name e plants_updated_count, conforme especificado na
--            arquitetura do sistema e esperado pelo painel desktop /zoneamento.
-- ============================================================================

drop function if exists public.assign_plants_to_zone(uuid, uuid[]);

create or replace function public.assign_plants_to_zone(
  p_zone_id uuid,
  p_plant_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
declare
  v_updated_count integer := 0;
  v_zone_name text;
begin
  select name into v_zone_name
  from public.zones
  where id = p_zone_id;

  if v_zone_name is null then
    raise exception 'Zona não encontrada: %', p_zone_id;
  end if;

  update public.plants
  set
    zone_id = p_zone_id,
    updated_at = now()
  where id = any(p_plant_ids);

  get diagnostics v_updated_count = row_count;

  return jsonb_build_object(
    'zone_id', p_zone_id,
    'zone_name', v_zone_name,
    'plants_updated_count', v_updated_count
  );
end;
$$;

revoke all on function public.assign_plants_to_zone(uuid, uuid[]) from public, anon;
grant execute on function public.assign_plants_to_zone(uuid, uuid[]) to authenticated;
