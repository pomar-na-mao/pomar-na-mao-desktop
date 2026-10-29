## Context

O sistema Desktop (Angular 19 + Tauri) gerencia entidades do pomar através de menus estruturados em `src/app/ui/components/layout/menu.ts` e rotas filhas em `src/app/ui/views/orchard/orchard.routes.ts`. Atualmente, o módulo de Insumos (`/cadastro/insumos`) fornece uma tabela com busca, paginação, seleção múltipla, modal de inserção/edição e exportação.

A nova funcionalidade de Caldas precisa permitir o agrupamento de múltiplos insumos em receitas pré-definidas para pulverização, com doses customizáveis a partir da dose da bula (`label_dose`), auditoria automática do autor logado, status ativo/inativo e persistência no Supabase.

## Goals / Non-Goals

**Goals:**
- Criar a rota `/cadastro/caldas` e o item de menu "Caldas" logo abaixo de "Insumos".
- Construir a tela de Caldas no mesmo layout, paleta e densidade de dados da tela de Insumos (`inputs.html`).
- Permitir adicionar, visualizar, editar e excluir caldas (inclusive exclusão em lote).
- Suportar a composição da calda com 1 ou mais insumos da tabela `inputs`, preenchendo inicialmente a dose com `label_dose` e permitindo alteração pelo usuário.
- Preencher automaticamente o nome e e-mail do operador autenticado a partir dos serviços de autenticação/usuário (`UsersRepository` e `AuthenticationRepository`).
- Modelar e implementar as tabelas relacionais `public.caldas` e `public.calda_insumos` com RLS, índices, triggers e integridade referencial.
- Gerar arquivo de migration SQL executável e documentar as alterações no `database.md` (processo no item 20 e queries no item 25).
- Cobrir todas as novas funcionalidades com testes unitários em conformidade com as regras do projeto.

**Non-Goals:**
- Não incluir a execução direta da pulverização em campo (escopo exclusivo do app mobile ou módulo de operações).
- Não permitir edição cadastral do insumo a partir da tela de caldas (apenas seleção e customização da dose aplicada na calda).
- Não alterar a tabela `inputs` existente nem quebrar rotinas dependentes.

## Decisions

### 1. Modelagem Relacional no Supabase: Duas Tabelas (`caldas` e `calda_insumos`)
- **Decisão**: Criar a entidade mestre `public.caldas` e a entidade dependente `public.calda_insumos` com chave estrangeira `calda_id` com `ON DELETE CASCADE` e `input_id` apontando para `public.inputs(id)` com `ON DELETE RESTRICT`.
- **Justificativa**: Garante normalização de dados, integridade referencial e histórico consistente. Se uma calda for excluída, seus itens são removidos em cascata sem deixar registros órfãos. Os insumos originais em `inputs` não podem ser deletados acidentalmente se estiverem presentes em caldas.
- **Alternativa Descartada**: Armazenar os insumos em coluna `jsonb` dentro de `caldas`. Isso dificultaria integridade referencial, consultas analíticas futuras e relatórios agregados de defensivos.

### 2. Formato e Tipagem da Dose (`dose text` e `dose_unit text`)
- **Decisão**: Utilizar `dose text` e `dose_unit text` em `calda_insumos`, espelhando a flexibilidade da coluna `label_dose text` e `dose_unit text` presente na tabela `public.inputs`.
- **Justificativa**: Na tabela `public.inputs`, as doses de bula muitas vezes contêm faixas ou formatos descritivos (ex: "150-200 ml / 100L", "2,5 kg/ha"). O campo em formato textual preserva fielmente a dose de bula carregada e dá liberdade para ajustes sem perda de formatação ou erros de conversão numérica.

### 3. Captura dos Dados do Usuário Autenticado
- **Decisão**: Injetar `UsersRepository` e `AuthenticationRepository` no `CaldasViewModel`. Ao submeter o formulário de inclusão, obter o nome do usuário logado via `usersRepository.currentUser()?.full_name` (com fallback para `user.user_metadata['full_name']` ou `user.email`) e o e-mail via `authenticationRepository.user()?.email`.
- **Justificativa**: Evita que o usuário precise digitar manualmente seu próprio nome e e-mail, garantindo auditoria confiável no momento da criação.

### 4. Padrão de Arquitetura Frontend (Clean Architecture / MVVM)
- **Decisão**: Seguir estritamente a convenção existente em `inputs`:
  - `src/app/domain/models/calda.model.ts`: Tipos `CaldaItem`, `CaldaDraft`, `CaldaInsumoItem`, `CaldaInsumoDraft`.
  - `src/app/data/repositories/caldas/caldas.repository.ts`: Comunicação direta com a API PostgREST do Supabase (`supabaseClient.from('caldas')`).
  - `src/app/data/services/caldas/caldas.service.ts`: Camada de orquestração de chamadas assíncronas e tratamento de erros.
  - `src/app/ui/view-models/caldas/caldas.view-model.ts`: Estado reativo com Angular Signals, formulários reativos (`FormGroup`, `FormArray`), validações e controle de diálogos.
  - `src/app/ui/views/caldas/caldas.ts`: Componente visual com PrimeNG (`p-table`, `p-dialog`, `p-button`, `p-select`, `p-inputtext`, `p-textarea`, `p-toggleswitch`, etc.) e tags self-closing no template HTML.

## Database Contract & Migration Impact

### Esquema das Tabelas

```sql
create table if not exists public.caldas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registered_by_name text not null,
  registered_by_email text not null,
  is_active boolean not null default true,
  observations text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_caldas_name unique (name),
  constraint chk_caldas_name_not_empty check (length(btrim(name)) > 0)
);

create table if not exists public.calda_insumos (
  id uuid primary key default gen_random_uuid(),
  calda_id uuid not null references public.caldas(id) on delete cascade,
  input_id uuid not null references public.inputs(id) on delete restrict,
  dose text not null,
  dose_unit text,
  created_at timestamptz not null default now(),
  constraint uq_calda_insumos_unique unique (calda_id, input_id),
  constraint chk_calda_insumos_dose_not_empty check (length(btrim(dose)) > 0)
);

-- Índices
create index if not exists idx_caldas_name on public.caldas (name);
create index if not exists idx_caldas_is_active on public.caldas (is_active);
create index if not exists idx_calda_insumos_calda_id on public.calda_insumos (calda_id);
create index if not exists idx_calda_insumos_input_id on public.calda_insumos (input_id);

-- Trigger de updated_at para caldas
create or replace function public.handle_caldas_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_caldas_updated_at on public.caldas;
create trigger trg_caldas_updated_at
  before update on public.caldas
  for each row execute procedure public.handle_caldas_updated_at();

-- RLS
alter table public.caldas enable row level security;
alter table public.calda_insumos enable row level security;

create policy "authenticated_users_caldas_all" on public.caldas
  for all to authenticated using (true) with check (true);

create policy "authenticated_users_calda_insumos_all" on public.calda_insumos
  for all to authenticated using (true) with check (true);
```

### Atualizações no `database.md`
- **Seção 20**: Adicionar o subitem detalhando o processo operacional desktop "Cadastro e Gerenciamento de Caldas (`/cadastro/caldas`)", descrevendo ciclo de vida, preenchimento de doses a partir de `inputs`, autoria via usuário autenticado e ações de CRUD.
- **Seção 25**: Adicionar a subseção contendo o script executável consolidado de criação de `caldas`, `calda_insumos`, índices, triggers de atualização e políticas de RLS.

## Risks / Trade-offs

- **[Risco] Insumo deletado da tabela `inputs` que pertence a uma calda** → Mitigado pela constraint `ON DELETE RESTRICT` em `calda_insumos.input_id`. O banco de dados impede a exclusão acidental de insumos em uso.
- **[Risco] Sessão sem nome do usuário carregado no momento do cadastro** → Mitigado com estratégia de fallback em cadeia (`currentUser.full_name` → `user_metadata.full_name` → `user.email` → "Usuário").
- **[Risco] Descompasso visual com a tela de Insumos** → Mitigado pela reutilização direta dos estilos, classes de layout Tailwind (`flex h-[calc(100vh-8rem)] ...`), componentes de cabeçalho, tabela PrimeNG e diálogos de confirmação.

## Migration Plan

1. Criar arquivo de migração versionado em `supabase/migrations/<timestamp>_create_caldas_tables.sql`.
2. Atualizar a documentação do banco de dados em `database.md` nas seções 20 e 25.
3. Desenvolver modelos e camadas de repositório/serviço no frontend.
4. Desenvolver ViewModel com Signals e View de Caldas.
5. Adicionar rota em `orchard.routes.ts` e item em `menu.ts`.
6. Criar e validar testes unitários automatizados para cada componente e camada.
7. Validar build e integridade de tipos.
