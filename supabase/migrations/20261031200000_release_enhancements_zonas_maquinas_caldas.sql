-- =========================================================
-- Release Enhancements: Máquinas e Insumos de Caldas
-- 1. machines: Adicionar volume do tanque em Litros (tank_volume_liters)
-- 2. mixture_inputs: Adicionar volume/massa (volume_or_mass) e unidade (unit)
-- Sistema: Pomar na Mão
-- =========================================================

begin;

-- 1. Coluna de Volume do Tanque na tabela machines
alter table public.machines
  add column if not exists tank_volume_liters numeric;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_machines_tank_volume_positive'
  ) then
    alter table public.machines
      add constraint chk_machines_tank_volume_positive
      check (tank_volume_liters is null or tank_volume_liters >= 0);
  end if;
end $$;

-- 2. Colunas de Volume ou Massa e Unidade na tabela mixture_inputs
alter table public.mixture_inputs
  add column if not exists volume_or_mass numeric,
  add column if not exists unit text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_mixture_inputs_volume_or_mass_positive'
  ) then
    alter table public.mixture_inputs
      add constraint chk_mixture_inputs_volume_or_mass_positive
      check (volume_or_mass is null or volume_or_mass >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_mixture_inputs_unit_valid'
  ) then
    alter table public.mixture_inputs
      add constraint chk_mixture_inputs_unit_valid
      check (unit is null or unit in ('kg', 'L'));
  end if;
end $$;

commit;
