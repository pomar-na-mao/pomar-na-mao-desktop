## 1. Banco de Dados e Migração Supabase

- [x] 1.1 Criar arquivo de migração SQL `supabase/migrations/20261028210000_create_mixtures_tables.sql` contendo as tabelas `public.mixtures` e `public.mixture_inputs`, restrições de integridade, índices, trigger para `updated_at` e políticas RLS para `authenticated`, verificando a sintaxe SQL.
- [x] 1.2 Atualizar o arquivo `database.md` documentando o processo operacional desktop de Cadastro e Gerenciamento de Caldas no item 20 (subitem 20.13), descrevendo fluxo, regras de dosagem e autoria do usuário logado.
- [x] 1.3 Atualizar o arquivo `database.md` adicionando a query/migration executável completa no item 25 (subitem 25.6) com instruções de aplicação e rollback.

## 2. Modelos de Domínio e Camada de Dados

- [x] 2.1 Criar as interfaces e tipos de domínio em `src/app/domain/models/mixture.model.ts` (`MixtureItem`, `MixtureDraft`, `MixtureInputItem`, `MixtureInputDraft`), garantindo tipagem estrita para dados da calda e insumos associados.
- [x] 2.2 Implementar o repositório `src/app/data/repositories/mixtures/mixtures.repository.ts` com operações de listagem com join de insumos, inserção de calda com seus insumos, atualização, exclusão individual e em lote.
- [x] 2.3 Implementar os testes unitários do repositório em `src/app/data/repositories/mixtures/mixtures.repository.spec.ts`, verificando chamadas ao cliente Supabase e tratamento de erros.
- [x] 2.4 Implementar o serviço de negócio `src/app/data/services/mixtures/mixtures.service.ts` e seus testes unitários em `src/app/data/services/mixtures/mixtures.service.spec.ts`.

## 3. ViewModel e Gestão de Estado

- [x] 3.1 Implementar `src/app/ui/view-models/mixtures/mixtures.view-model.ts` com signals reativos para listagem, formulário reativo com `FormArray` para insumos da calda, injeção de `InputsRepository` para seleção de insumos disponíveis, preenchimento automático da dose inicial com `label_dose` da bula, captura do nome e e-mail do autor via `UsersRepository` / `AuthenticationRepository`, e controle dos modais.
- [x] 3.2 Implementar os testes unitários do ViewModel em `src/app/ui/view-models/mixtures/mixtures.view-model.spec.ts`, cobrindo inicialização, inclusão de insumos com dose padrão de bula, edição de dose, validação de campos obrigatórios, submissão de cadastro, edição e exclusão.

## 4. Interface de Usuário e Integração de Navegação

- [x] 4.1 Criar o componente de visualização `src/app/ui/views/mixtures/mixtures.ts`, `mixtures.html` e `mixtures.css`, utilizando tags self-closing e PrimeNG (`p-table`, `p-dialog`, `p-button`, `p-select`, `p-inputtext`, `p-textarea`, `p-toggleswitch`), reproduzindo o layout da tela de Insumos.
- [x] 4.2 Registrar a rota filha `caldas` em `src/app/ui/views/orchard/orchard.routes.ts` apontando para o componente `Mixtures`.
- [x] 4.3 Inserir o item "Caldas" no menu lateral em `src/app/ui/components/layout/menu.ts` na seção "Cadastro", posicionado imediatamente abaixo de "Insumos" com rota `['/cadastro/caldas']`.
- [x] 4.4 Criar os testes unitários do componente visual em `src/app/ui/views/mixtures/mixtures.spec.ts` e atualizar `src/app/ui/components/layout/menu.spec.ts`, `src/app/app.routes.spec.ts` e `src/app/ui/views/orchard/orchard.routes.spec.ts` para validar navegação e renderização.

## 5. Validação e Qualidade

- [x] 5.1 Executar a suíte de testes unitários do Angular (`npm test`) e verificar se todos os testes novos e existentes passam com 100% de sucesso.
- [x] 5.2 Executar a verificação de linting (`npm run lint`) e de build (`npm run build`) para assegurar conformidade arquitetural e ausência de erros de compilação TypeScript.
