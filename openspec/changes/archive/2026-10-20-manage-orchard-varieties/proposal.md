## Why

A rota `/pomar/variedades` existe, mas ainda não oferece uma interface para administrar o catálogo persistido em `public.varieties`. Centralizar essa gestão no desktop elimina ajustes manuais recorrentes, melhora a rastreabilidade das alterações e disponibiliza uma experiência consistente com a tela de Usuários.

## What Changes

- Exibir as variedades do Supabase em uma tabela PrimeNG com nome, descrição, data de criação, data de atualização e ações por registro.
- Permitir busca global, ordenação, paginação e exportação dos dados visíveis para Excel.
- Permitir selecionar uma ou várias variedades por checkboxes na primeira coluna e excluir tanto um registro quanto a seleção em lote, sempre mediante confirmação PrimeNG.
- Permitir criar e editar variedades por um modal PrimeNG com validação dos campos.
- Exibir feedback de sucesso ou erro por toast e bloquear a interface durante operações de criação, edição e exclusão.
- Acrescentar `updated_at` à definição de `public.varieties` em `database.md`; o aplicativo enviará `created_at` e `updated_at` iguais na criação e um novo `updated_at` em cada edição.
- Criar os modelos, serviço, repositório/view-model e testes unitários necessários para integrar a tela ao Supabase conforme a arquitetura atual.

## Capabilities

### New Capabilities

- `orchard-variety-management`: Gestão completa do catálogo de variedades na rota `/pomar/variedades`, incluindo listagem, busca, exportação, criação, edição, seleção e exclusão individual ou em lote.

### Modified Capabilities

<!-- Nenhuma capacidade existente terá seus requisitos alterados. -->

## Impact

- UI da rota `/pomar/variedades`, atualmente representada por um componente vazio.
- Camadas de domínio, acesso a dados e estado para operações CRUD sobre `public.varieties`.
- Componentes PrimeNG de tabela, formulário em diálogo, confirmação, toast, bloqueio e ícones; a exportação deverá gerar arquivo Excel compatível com a dependência escolhida na implementação.
- Esquema documentado de `public.varieties` em `database.md`, incluindo a coluna `updated_at` e a responsabilidade do aplicativo por enviar seu valor.
- Políticas RLS existentes para usuários autenticados continuam sendo usadas; não há alteração de rota nem mudança incompatível de API.
- O usuário aplicará manualmente no projeto Supabase a alteração de banco documentada por esta mudança.
