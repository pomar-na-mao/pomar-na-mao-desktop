## Why

Atualmente a rota `/cadastro/maquinas` exibe apenas um placeholder em desenvolvimento ("Em desenvolvimento"). Os gestores e operadores de pomar precisam cadastrar, gerenciar, editar e auditar o parque de máquinas e tratores da fazenda (nome, marca, ano de fabricação, data de aquisição, quantidade e observações técnicas), garantindo controle de ativos e histórico operacional unificado com o ecossistema desktop.

## What Changes

- Criação da tabela relacional `public.machines` no Supabase com suporte a nome, marca, data de aquisição, ano de fabricação, quantidade (default 1), observações e controle automático de `created_at` e `updated_at`.
- Definição de índices, trigger de atualização de data e políticas RLS de acesso para usuários autenticados.
- Criação dos modelos TypeScript de domínio em `src/app/domain/models/machine.model.ts`.
- Implementação de repositório de dados (`MachinesRepository`) e serviço (`MachinesService`) para operações CRUD completas (listagem, cadastro, edição, exclusão única e exclusão em lote).
- Implementação da `MachinesViewModel` reativa baseada em Signals e Reactive Forms para gerenciar listagem, busca textual, seleções, abertura de modais e submissão com validações (apenas `name` obrigatório).
- Substituição da tela placeholder em `src/app/ui/views/machines/` por uma visualização completa seguindo o layout padrão de `/cadastro/variedades` (tabela PrimeNG, busca global, botões de ação com tags self-closing, modal de criação/edição e confirmação de exclusão).
- Atualização da documentação arquitetural de banco de dados em `database.md` (item 20.14 para fluxo operacional e item 25.7 para queries/migration).
- Criação do arquivo de migração SQL `supabase/migrations/20261029100000_create_machines_table.sql`.
- Cobertura completa de testes unitários para repositório, serviço, ViewModel e componente.

## Capabilities

### New Capabilities
- `machines-management`: Cadastro, edição, exclusão individual/em lote e listagem do inventário de máquinas e implementos agrícolas da fazenda no módulo desktop.

### Modified Capabilities

## Impact

- **Banco de Dados (Supabase)**: Nova tabela `public.machines` e migração versionada.
- **Frontend Angular**:
  - `src/app/domain/models/machine.model.ts`
  - `src/app/data/repositories/machines/`
  - `src/app/data/services/machines/`
  - `src/app/ui/view-models/machines/`
  - `src/app/ui/views/machines/` (transformação do componente placeholder em view completa com PrimeNG)
- **Documentação**: `database.md` itens 20 e 25 atualizados.
