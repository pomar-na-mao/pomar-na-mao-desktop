-- =========================================================
-- Máquinas da Fazenda (machines)
-- Sistema: Pomar na Mão
-- =========================================================

begin;

-- 1. Tabela Principal de Máquinas (machines)
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  acquisition_date date,
  manufacturing_year integer check (manufacturing_year is null or (manufacturing_year >= 1900 and manufacturing_year <= 2100)),
  quantity integer not null default 1,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_machines_name_not_empty check (length(btrim(name)) > 0),
  constraint chk_machines_quantity_positive check (quantity >= 1)
);

-- 2. Índices de Busca e Performance
create index if not exists idx_machines_name on public.machines (name);
create index if not exists idx_machines_brand on public.machines (brand);
create index if not exists idx_machines_created_at on public.machines (created_at desc);

-- 3. Trigger de Atualização Automática de updated_at para machines
create or replace function public.handle_machines_updated_at()
returns trigger
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_machines_updated_at on public.machines;
create trigger trg_machines_updated_at
  before update on public.machines
  for each row execute procedure public.handle_machines_updated_at();

-- 4. Row Level Security (RLS) e Políticas de Acesso
alter table public.machines enable row level security;

drop policy if exists "Authenticated users can read machines" on public.machines;
create policy "Authenticated users can read machines" on public.machines
  for select to authenticated using (true);

drop policy if exists "Anonymous users can read machines" on public.machines;
create policy "Anonymous users can read machines" on public.machines
  for select to anon using (true);

drop policy if exists "Authenticated users can insert machines" on public.machines;
create policy "Authenticated users can insert machines" on public.machines
  for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update machines" on public.machines;
create policy "Authenticated users can update machines" on public.machines
  for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated users can delete machines" on public.machines;
create policy "Authenticated users can delete machines" on public.machines
  for delete to authenticated using (true);

-- 5. Permissões de Acesso (Grants)
grant select on public.machines to anon, authenticated;
grant insert, update, delete on public.machines to authenticated;

commit;
