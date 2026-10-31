-- =========================================================
-- Associação de Máquina a Atividades de Campo
-- Adiciona colunas machine_id e machine_name_snapshot em activity_entries
-- Atualiza a RPC public.get_field_activities para retornar dados da máquina
-- Sistema: Pomar na Mão
-- =========================================================

begin;

-- 1. Colunas na tabela activity_entries
alter table public.activity_entries
  add column if not exists machine_id uuid references public.machines(id) on delete set null,
  add column if not exists machine_name_snapshot text,
  add column if not exists machine_brand_snapshot text;

create index if not exists idx_activity_entries_machine_id on public.activity_entries (machine_id);

-- 2. Drop da função anterior (necessário no PostgreSQL para alterar as colunas de retorno de um RETURNS TABLE)
drop function if exists public.get_field_activities(date, date);

-- 3. Atualizar a RPC de consulta de atividades de campo com machine_id e machine_name
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
  machine_id uuid,
  machine_name text,
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
    e.machine_id,
    coalesce(e.machine_name_snapshot, mac.name) as machine_name,
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
  left join public.machines mac on mac.id = e.machine_id
  where (p_start_date is null or (e.performed_at at time zone 'America/Sao_Paulo')::date >= p_start_date)
    and (p_end_date is null or (e.performed_at at time zone 'America/Sao_Paulo')::date <= p_end_date)
  order by e.performed_at desc;
$$;

revoke all on function public.get_field_activities(date, date) from public, anon;
grant execute on function public.get_field_activities(date, date) to authenticated;

commit;
