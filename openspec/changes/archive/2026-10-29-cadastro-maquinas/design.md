## Context

Ver `proposal.md` para motivação e escopo da funcionalidade. A rota `/cadastro/maquinas` já está registrada em `src/app/ui/views/orchard/orchard.routes.ts` e presente no menu lateral em `src/app/ui/components/layout/menu.ts`, porém renderiza um componente placeholder inline ("Em desenvolvimento"). A arquitetura do sistema segue separação estrita em camadas:
- **Domain**: Interfaces e tipos em `src/app/domain/models/`.
- **Data**: Repositórios (`Repositories`) com cliente Supabase e Serviços de negócio em `src/app/data/`.
- **UI (MVVM)**: ViewModels reativos baseados em Angular Signals e Reactive Forms em `src/app/ui/view-models/`, e Views em `src/app/ui/views/` utilizando componentes PrimeNG com self-closing tags e Tailwind CSS.
- **Documentação de Banco de Dados**: Centralizada em `database.md` (Itens 20 e 25).

## Goals / Non-Goals

**Goals:**
- Criar a tabela `public.machines` no Supabase com integridade referencial, trigger de `updated_at`, índices e políticas RLS.
- Implementar repositório, serviço e ViewModel com signals e validações (apenas `name` obrigatório, `quantity` padrão 1).
- Substituir o componente placeholder por uma interface completa espelhada no padrão de `/cadastro/variedades` (tabela, busca textual, seleção múltipla, exportação Excel, modais de cadastro/edição e diálogo de confirmação de exclusão).
- Atualizar a documentação no `database.md` nos itens 20 e 25 e fornecer o arquivo de migração SQL.
- Alcançar 100% de aprovação nos testes unitários e linter.

**Non-Goals:**
- Manutenção de horímetro, consumo de combustível ou telemetria em tempo real (fora do escopo inicial de cadastro patrimonial).
- Vínculo direto de máquinas a operações de campo no mobile (previsto para etapas futuras de sincronização).

## Decisions

### 1. Modelagem da Tabela `public.machines`
- **Decisão**: Criar a tabela `public.machines` com chave UUID padrão `gen_random_uuid()`, colunas `name` (text not null), `brand` (text nullable), `acquisition_date` (date nullable), `manufacturing_year` (integer nullable com check de ano plausível), `quantity` (integer not null default 1 check >= 1), `observations` (text nullable), e timestamptz com default `now()` para `created_at` e `updated_at`.
- **Alternativa Considerada**: Criar uma linha individual por unidade física (número de série).
- **Justificativa**: A especificação do usuário define explicitamente que a mesma máquina pode ser cadastrada indicando a quantidade de unidades existentes (1, 2 ou mais), tornando a coluna `quantity` mais prática e flexível.

### 2. Validações no Formulário
- **Decisão**: Apenas `name` é campo obrigatório no Reactive Form (`Validators.required`, `Validators.maxLength(150)`). Os demais campos são opcionais. Caso o usuário não preencha quantidade, o valor padrão adotado é 1.
- **Alternativa Considerada**: Exigir marca ou ano de fabricação.
- **Justificativa**: Respeita fielmente a exigência do usuário: "Apenas a coluna nome é obrigatório na adição/edição".

### 3. Padrão Visual Idêntico a `/cadastro/variedades`
- **Decisão**: Utilizar a mesma estrutura de card com cabeçalho contendo título, descrição, botões de ação ("Excluir selecionados", "Download Excel", "Adicionar Máquina"), barra de busca global, `p-table` com checkboxes, ordenação, paginação e modal `p-dialog` com inputs estilizados via Tailwind e PrimeNG.
- **Justificativa**: Garante consistência visual imediata e familiaridade ao operador do pomar.

## Risks / Trade-offs

- **[Risco de Ano de Fabricação Inválido]** → O campo `manufacturing_year` possui validação numérica no formulário e restrição de integridade no banco (`manufacturing_year is null or (manufacturing_year >= 1900 and manufacturing_year <= 2100)`).
- **[Risco de Exclusão Acidental]** → Exclusões individuais ou em lote exigem confirmação modal via `ConfirmationService` do PrimeNG.

## Migration Plan

1. Criar migration SQL `supabase/migrations/20261029100000_create_machines_table.sql`.
2. Aplicar no Supabase e registrar no `database.md` (itens 20.14 e 25.7).
3. Rollback: `drop table if exists public.machines cascade;`.
