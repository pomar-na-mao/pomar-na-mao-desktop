## Why

Atualmente, o sistema gerencia o catálogo de insumos fitossanitários de forma individual na tela de Insumos, porém os produtores e agrônomos preparam caldas compostas por misturas de um ou mais insumos com dosagens específicas (ou herdadas da bula) para aplicação nas operações de pulverização do pomar. 

A introdução do módulo de Caldas centraliza a criação, parametrização, auditoria de autoria (usuário logado) e ativação dessas receitas fitossanitárias, permitindo consistência nas operações agrícolas do desktop.

## What Changes

- **Novas Tabelas e Migrações de Banco de Dados**:
  - Criação das tabelas `caldas` (ou `spray_mixtures`) e `calda_insumos` (ou `spray_mixture_inputs`) no Supabase, armazenando nome da calda, status ativo/inativo, observações gerais, nome e e-mail do autor autenticado, timestamps (`created_at`, `updated_at`), e a lista associada de insumos da tabela `inputs` com suas respectivas doses configuráveis (iniciando com o valor padrão de bula `label_dose`).
  - Configuração de políticas de segurança Row Level Security (RLS), índices de performance e integridade referencial com exclusão em cascata para os itens da calda.
  - Geração do arquivo de migration SQL executável e atualização formal do arquivo `database.md` (detalhamento do fluxo operacional no item 20 e inclusão do script completo no item 25).

- **Navegação e Rotas**:
  - Inclusão do item de menu "Caldas" no menu lateral dentro da seção "Cadastro", posicionado imediatamente abaixo de "Insumos", apontando para `/cadastro/caldas`.
  - Registro da rota `/cadastro/caldas` em `src/app/ui/views/orchard/orchard.routes.ts` com carregamento lazy component.

- **Interface Desktop e Experiência do Usuário (UI/UX)**:
  - Criação da view `Caldas` (`/cadastro/caldas`) espelhando fielmente o padrão visual, estrutura e densidade de dados da tela de Insumos (`/cadastro/insumos`), construída com PrimeNG e Tailwind CSS.
  - Listagem com tabela interativa, filtros, seleção múltipla para exclusão em lote, status visual (badge de ativa/inativa), resumo dos insumos que compõem a calda e ações rápidas (visualizar, editar, excluir).
  - Modal de cadastro e edição de calda com validações reativas, seletor de insumos disponíveis da tabela `inputs`, adição dinâmica de insumos com ajuste de dose (preenchida automaticamente com a dose de bula do insumo), captura automática do nome e e-mail do usuário autenticado logado, switch de status ativo e campo para observações gerais e recomendações.
  - Modal de detalhes para visualização detalhada da composição da calda e seus metadados.

- **Camada de Domínio, Dados e Estado (Clean Architecture / MVVM)**:
  - Modelos de domínio (`calda.model.ts`).
  - Repositório Supabase (`caldas.repository.ts`) e Serviço de negócio (`caldas.service.ts`).
  - ViewModel reativo com Angular Signals (`caldas.view-model.ts`).

- **Qualidade e Testes Unitários**:
  - Testes unitários para todas as novas camadas: Repositório, Serviço, ViewModel, Componente de tela e Atualizações nos testes de Rotas e Menu.

## Capabilities

### New Capabilities
- `caldas-management`: Gerenciamento completo do catálogo de caldas de pulverização no painel desktop, englobando persistência relacional com insumos da tabela `inputs`, parametrização de dosagens, controle de autoria do usuário logado, ciclo de vida ativo/inativo e interface alinhada à tela de Insumos.

### Modified Capabilities
<!-- Nenhuma especificação anterior sofreu alteração de requisitos funcionais -->

## Impact

- **Banco de Dados**: Novas tabelas `public.caldas` e `public.calda_insumos`, migration dedicada e atualizações documentais em `database.md` (itens 20 e 25).
- **Rotas e Navegação**: `src/app/ui/views/orchard/orchard.routes.ts`, `src/app/ui/components/layout/menu.ts`.
- **Novos Arquivos**:
  - `src/app/domain/models/calda.model.ts`
  - `src/app/data/repositories/caldas/caldas.repository.ts`
  - `src/app/data/repositories/caldas/caldas.repository.spec.ts`
  - `src/app/data/services/caldas/caldas.service.ts`
  - `src/app/data/services/caldas/caldas.service.spec.ts`
  - `src/app/ui/view-models/caldas/caldas.view-model.ts`
  - `src/app/ui/view-models/caldas/caldas.view-model.spec.ts`
  - `src/app/ui/views/caldas/caldas.ts`
  - `src/app/ui/views/caldas/caldas.html`
  - `src/app/ui/views/caldas/caldas.css`
  - `src/app/ui/views/caldas/caldas.spec.ts`
  - `supabase/migrations/<timestamp>_create_caldas_tables.sql`
