-- =========================================================
-- Visualização de Atividades de Campo (activity_entries)
-- Função RPC e permissões para leitura no Desktop
-- Sistema: Pomar na Mão
-- =========================================================

begin;

-- 1. Permissões de Leitura nas tabelas de atividades
grant select on table public.activity_entries to authenticated;
grant select on table public.activity_entry_inputs to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'activity_entries' and policyname = 'authenticated_select_activity_entries'
  ) then
    create policy "authenticated_select_activity_entries"
      on public.activity_entries for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'activity_entry_inputs' and policyname = 'authenticated_select_activity_entry_inputs'
  ) then
    create policy "authenticated_select_activity_entry_inputs"
      on public.activity_entry_inputs for select
      to authenticated
      using (true);
  end if;
end;
$$;

-- 2. RPC de consulta de atividades de campo com geometria GeoJSON e composição de insumos
create or replace function public.get_field_activities(
  p_start_date date default null,
  p_end_date date default null
)
returns table (
  id uuid,
  field_operation_id uuid,
  activity text,
  responsible text,
  performed_at timestamptz,
  geometry_type text,
  geometry_geojson jsonb,
  mixture_id uuid,
  mixture_name text,
  device_id text,
  local_id text,
  created_at timestamptz,
  updated_at timestamptz,
  inputs jsonb
)
language sql
security definer
set search_path = ''
as $$
  select
    e.id,
    e.field_operation_id,
    e.activity,
    e.responsible,
    e.performed_at,
    e.geometry_type,
    extensions.st_asgeojson(e.geometry)::jsonb as geometry_geojson,
    e.mixture_id,
    coalesce(e.mixture_name_snapshot, m.name) as mixture_name,
    e.device_id,
    e.local_id,
    e.created_at,
    e.updated_at,
    coalesce(
      (
        select jsonb_agg(jsonb_build_object(
          'id', i.id,
          'input_id', i.input_id,
          'name', i.name_snapshot,
          'active_ingredient', i.active_ingredient_snapshot,
          'label_dose', i.label_dose_snapshot,
          'dose_unit', i.dose_unit_snapshot,
          'applied_dose', i.applied_dose
        ) order by i.created_at)
        from public.activity_entry_inputs i
        where i.activity_entry_id = e.id
      ),
      '[]'::jsonb
    ) as inputs
  from public.activity_entries e
  left join public.mixtures m on m.id = e.mixture_id
  where (p_start_date is null or (e.performed_at at time zone 'America/Sao_Paulo')::date >= p_start_date)
    and (p_end_date is null or (e.performed_at at time zone 'America/Sao_Paulo')::date <= p_end_date)
  order by e.performed_at desc;
$$;

revoke all on function public.get_field_activities(date, date) from public, anon;
grant execute on function public.get_field_activities(date, date) to authenticated;

commit;
