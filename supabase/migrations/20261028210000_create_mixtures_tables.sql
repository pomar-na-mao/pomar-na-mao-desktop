-- =========================================================
-- Caldas de Pulverização (mixtures) e Insumos da Calda (mixture_inputs)
-- Sistema: Pomar na Mão
-- =========================================================

begin;

-- 1. Tabela Principal de Caldas (mixtures)
create table if not exists public.mixtures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registered_by_name text not null,
  registered_by_email text not null,
  is_active boolean not null default true,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_mixtures_name unique (name),
  constraint chk_mixtures_name_not_empty check (length(btrim(name)) > 0),
  constraint chk_mixtures_registered_by_name_not_empty check (length(btrim(registered_by_name)) > 0),
  constraint chk_mixtures_registered_by_email_not_empty check (length(btrim(registered_by_email)) > 0)
);

-- 2. Tabela de Insumos da Calda (mixture_inputs)
create table if not exists public.mixture_inputs (
  id uuid primary key default gen_random_uuid(),
  mixture_id uuid not null references public.mixtures(id) on delete cascade,
  input_id uuid not null references public.inputs(id) on delete restrict,
  dose text not null,
  dose_unit text,
  created_at timestamptz not null default now(),
  constraint uq_mixture_inputs_unique unique (mixture_id, input_id),
  constraint chk_mixture_inputs_dose_not_empty check (length(btrim(dose)) > 0)
);

-- 3. Índices de Busca e Performance
create index if not exists idx_mixtures_name on public.mixtures (name);
create index if not exists idx_mixtures_is_active on public.mixtures (is_active);
create index if not exists idx_mixtures_created_at on public.mixtures (created_at desc);
create index if not exists idx_mixture_inputs_mixture_id on public.mixture_inputs (mixture_id);
create index if not exists idx_mixture_inputs_input_id on public.mixture_inputs (input_id);

-- 4. Trigger de Atualização Automática de updated_at para mixtures
create or replace function public.handle_mixtures_updated_at()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_mixtures_updated_at on public.mixtures;
create trigger trg_mixtures_updated_at
  before update on public.mixtures
  for each row execute procedure public.handle_mixtures_updated_at();

-- 5. Row Level Security (RLS) e Políticas de Acesso
alter table public.mixtures enable row level security;
alter table public.mixture_inputs enable row level security;

-- Políticas para mixtures
drop policy if exists "Authenticated users can read mixtures" on public.mixtures;
create policy "Authenticated users can read mixtures" on public.mixtures
  for select to authenticated using (true);

drop policy if exists "Anonymous users can read mixtures" on public.mixtures;
create policy "Anonymous users can read mixtures" on public.mixtures
  for select to anon using (true);

drop policy if exists "Authenticated users can insert mixtures" on public.mixtures;
create policy "Authenticated users can insert mixtures" on public.mixtures
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update mixtures" on public.mixtures;
create policy "Authenticated users can update mixtures" on public.mixtures
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete mixtures" on public.mixtures;
create policy "Authenticated users can delete mixtures" on public.mixtures
  for delete to authenticated using (true);

-- Políticas para mixture_inputs
drop policy if exists "Authenticated users can read mixture_inputs" on public.mixture_inputs;
create policy "Authenticated users can read mixture_inputs" on public.mixture_inputs
  for select to authenticated using (true);

drop policy if exists "Anonymous users can read mixture_inputs" on public.mixture_inputs;
create policy "Anonymous users can read mixture_inputs" on public.mixture_inputs
  for select to anon using (true);

drop policy if exists "Authenticated users can insert mixture_inputs" on public.mixture_inputs;
create policy "Authenticated users can insert mixture_inputs" on public.mixture_inputs
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update mixture_inputs" on public.mixture_inputs;
create policy "Authenticated users can update mixture_inputs" on public.mixture_inputs
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete mixture_inputs" on public.mixture_inputs;
create policy "Authenticated users can delete mixture_inputs" on public.mixture_inputs
  for delete to authenticated using (true);

-- 6. Permissões de Acesso (Grants)
grant select on public.mixtures to anon, authenticated;
grant insert, update, delete on public.mixtures to authenticated;

grant select on public.mixture_inputs to anon, authenticated;
grant insert, update, delete on public.mixture_inputs to authenticated;

commit;
