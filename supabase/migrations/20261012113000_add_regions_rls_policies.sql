-- Adiciona políticas de Row Level Security (RLS) faltantes para a tabela public.regions
-- Permite que usuários autenticados realizem inserção, atualização e exclusão dos vértices de zonas (necessário para a RPC create_zone_with_regions).

begin;

-- Garante que RLS está habilitado
alter table public.regions enable row level security;

-- Recria/Garante a política de leitura anônima e autenticada
drop policy if exists "Anonymous users can read regions" on public.regions;
create policy "Anonymous users can read regions"
  on public.regions
  for select
  to anon
  using (true);

drop policy if exists "Authenticated users can read regions" on public.regions;
create policy "Authenticated users can read regions"
  on public.regions
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert regions" on public.regions;
create policy "Authenticated users can insert regions"
  on public.regions
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update regions" on public.regions;
create policy "Authenticated users can update regions"
  on public.regions
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated users can delete regions" on public.regions;
create policy "Authenticated users can delete regions"
  on public.regions
  for delete
  to authenticated
  using (true);

-- Concessões de privilégios para os roles caso ainda não existam
grant select on table public.regions to anon, authenticated;
grant insert, update, delete on table public.regions to authenticated;

commit;
