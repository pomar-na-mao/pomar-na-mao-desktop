## 1. Banco de Dados e Migração Supabase

- [x] 1.1 Criar arquivo de migração SQL `supabase/migrations/20261029100000_create_machines_table.sql` contendo a tabela `public.machines`, restrições de integridade, índices, trigger para `updated_at` e políticas RLS para `authenticated`, verificando a sintaxe SQL.
- [x] 1.2 Atualizar o arquivo `database.md` documentando o processo operacional desktop de Cadastro e Gerenciamento de Máquinas no item 20 (subitem 20.14), descrevendo fluxo, regras de validação e modelo relacional.
- [x] 1.3 Atualizar o arquivo `database.md` adicionando a query/migration executável completa no item 25 (subitem 25.7) com instruções de aplicação e rollback.

## 2. Modelos de Domínio e Camada de Dados

- [x] 2.1 Criar as interfaces e tipos de domínio em `src/app/domain/models/machine.model.ts` (`MachineItem`, `MachineDraft`, `MachineCreate`, `MachineUpdate`), garantindo tipagem estrita para os atributos da máquina.
- [x] 2.2 Implementar o repositório `src/app/data/repositories/machines/machines.repository.ts` com métodos `findAll`, `create`, `update` e `deleteMany` integrados ao cliente Supabase.
- [x] 2.3 Implementar os testes unitários do repositório em `src/app/data/repositories/machines/machines.repository.spec.ts`, validando consultas, mutações e tratamento de erros.
- [x] 2.4 Implementar o serviço de negócio `src/app/data/services/machines/machines.service.ts` e seus testes unitários em `src/app/data/services/machines/machines.service.spec.ts`.

## 3. ViewModel e Gestão de Estado

- [x] 3.1 Implementar `src/app/ui/view-models/machines/machines.view-model.ts` com signals reativos para listagem, formulário reativo com validação de obrigatoriedade restrita ao campo `name`, quantidade padrão 1, exportação para Excel via `write-excel-file` e controle de modais.
- [x] 3.2 Implementar os testes unitários do ViewModel em `src/app/ui/view-models/machines/machines.view-model.spec.ts`, cobrindo inicialização, submissão com dados mínimos, submissão completa, edição, validações e exclusão.

## 4. Interface de Usuário (View) e Layout Padronizado

- [x] 4.1 Substituir o componente placeholder em `src/app/ui/views/machines/machines.ts`, `machines.html` e `machines.css`, espelhando fielmente o padrão de layout de `/cadastro/variedades` com tags self-closing, tabela PrimeNG, filtros, modal de cadastro/edição e diálogo de confirmação.
- [x] 4.2 Implementar os testes unitários da visualização em `src/app/ui/views/machines/machines.spec.ts`, validando renderização, busca textual, abertura do diálogo e acionamento de ações.
- [x] 4.3 Atualizar eventuais testes de rotas ou placeholders (ex: `development-views.spec.ts`) para refletir que Máquinas agora é uma visualização funcional ativa.

## 5. Validação de Qualidade e Build

- [x] 5.1 Executar a suíte de testes unitários (`npm test`) verificando 100% de aprovação de todos os testes novos e de regressão.
- [x] 5.2 Executar o linter (`npm run lint`) e o build de produção (`npm run web:build`) para garantir conformidade arquitetural estrita e ausência de erros de compilação.
