## Why

A rota `/pomar/ocorrencias` existe, mas ainda não permite administrar o catálogo persistido em `public.occurrence_types`. Disponibilizar esse gerenciamento no desktop reduz alterações manuais no banco e mantém a experiência consistente com a tela de Variedades.

## What Changes

- Exibir os tipos de ocorrência do Supabase em uma tabela PrimeNG com nome, categoria, data de criação, data de atualização, seleção e ações por registro; ID e código permanecem internos.
- Permitir busca global, ordenação, paginação e exportação para Excel dos registros que atendem ao filtro atual.
- Permitir selecionar um ou vários tipos de ocorrência por checkboxes e excluir tanto uma linha quanto a seleção em lote, sempre mediante confirmação PrimeNG.
- Permitir criar e editar tipos de ocorrência em um diálogo PrimeNG com validação de nome e categoria, sem expor o código; na criação, gerar o código automaticamente a partir do nome em minúsculas e com palavras separadas por `_`, e na edição preservar o código existente.
- Diferenciar visualmente as categorias na tabela com cores estáveis e brilho sutil, mantendo rótulo textual e contraste adequado.
- Exibir feedback de sucesso ou erro por toast e bloquear a interface durante operações de criação, edição e exclusão.
- Acrescentar `updated_at` às duas definições de `public.occurrence_types` em `database.md`; na criação, o aplicativo enviará `created_at` e `updated_at` com o mesmo instante e, na edição, renovará apenas `updated_at`.
- Documentar o enum PostgreSQL `occurrence_category` com os valores `STRUCTURAL`, `ENVIRONMENTAL`, `PEST_DISEASE` e `ANTHROPIC`, além da coluna `category` em `public.occurrence_types` e sua migração a partir de uma coluna textual existente.
- Criar modelos, serviço, repositório, view-model, exportação Excel e testes unitários seguindo a implementação existente de Variedades.

## Capabilities

### New Capabilities

- `orchard-occurrence-management`: Gestão completa do catálogo de tipos de ocorrência na rota `/pomar/ocorrencias`, incluindo listagem, busca, exportação, criação, edição, seleção e exclusão individual ou em lote.

### Modified Capabilities

<!-- Nenhuma capacidade existente terá seus requisitos alterados. -->

## Impact

- UI da rota `/pomar/ocorrencias`, atualmente representada por um componente vazio.
- Camadas de domínio, acesso a dados, estado e exportação para operações CRUD sobre `public.occurrence_types`.
- Componentes PrimeNG de tabela, formulário em diálogo, confirmação, toast, bloqueio e ícones; a exportação reutilizará a dependência e o padrão Excel adotados em Variedades.
- Esquema documentado de `public.occurrence_types` em `database.md`, incluindo `updated_at` e a sequência de migração para registros existentes.
- Restrições existentes, como unicidade de `code`, RLS e referências a `occurrence_types`, continuam vigentes; erros de integridade serão apresentados ao usuário sem remover registros da tabela local.
- O usuário aplicará manualmente no Supabase a alteração de banco documentada por esta mudança.
