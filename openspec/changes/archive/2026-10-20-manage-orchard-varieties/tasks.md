## 1. Banco de dados e contrato de domínio

- [x] 1.1 Atualizar as duas definições de `public.varieties` em `database.md` com `updated_at timestamptz not null default now()` e documentar o SQL incremental idempotente que copia `created_at` para registros existentes, sem trigger automático; verificar que o documento contém o contrato final e a sequência manual completa para o Supabase.
- [x] 1.2 Criar o modelo de domínio `Variety`, o rascunho sem campos técnicos e os tipos de payload com timestamps enviados pelo cliente; verificar por compilação TypeScript e teste unitário de tipagem/uso que os campos persistidos têm os tipos esperados.

## 2. Acesso a dados e estado

- [x] 2.1 Implementar `VarietiesService` com leitura ordenada, criação, atualização com retorno da linha persistida e exclusão em lote por IDs, incluindo cache e invalidação dos namespaces relacionados; verificar com testes unitários os encadeamentos Supabase, respostas de sucesso/erro e invalidações.
- [x] 2.2 Implementar `VarietiesRepository` com signal da coleção e atualizações locais somente após mutações bem-sucedidas; verificar com testes unitários carga, inserção, substituição, exclusão múltipla e preservação do estado em falhas.
- [x] 2.3 Implementar o view-model de Variedades com carga inicial, formulário reativo compartilhado entre inclusão/edição, normalização de campos, seleção e fluxos assíncronos com toast e `LoadingService` em `try/finally`; verificar com testes unitários validação, mensagens, abertura/fechamento de diálogo, bloqueio e recuperação de erros.

## 3. Tabela e ações de gerenciamento

- [x] 3.1 Substituir o componente vazio de `/pomar/variedades` por uma tabela PrimeNG baseada no layout de Usuários, exibindo seleção, nome, descrição, criação, atualização e ações, com datas `pt-BR`, ordenação, paginação, loading inicial e estados vazio/erro; verificar com testes de componente a renderização de dados, colunas, responsividade semântica e estados da consulta.
- [x] 3.2 Adicionar busca global por nome e descrição e seleção simples/múltipla com `p-tableCheckbox` e `p-tableHeaderCheckbox`; verificar com testes de componente filtragem sem diferenciar caixa, estado sem resultados e atualização da seleção.
- [x] 3.3 Adicionar o diálogo PrimeNG autocontido para criar e editar, com nome obrigatório, descrição opcional e botões acessíveis; verificar com testes de componente abertura nos dois modos, preenchimento, mensagens de validação, cancelamento e envio válido.
- [x] 3.4 Adicionar ações PrimeNG de editar, excluir uma linha e excluir selecionadas, com tooltips/nomes acessíveis e confirmação individual ou em lote antes da mutação; verificar com testes de componente textos/contagens da confirmação, cancelamento sem exclusão, aceite e estado habilitado do botão em lote.

## 4. Exportação Excel

- [x] 4.1 Adicionar a dependência `write-excel-file` e encapsular a geração dinâmica da planilha em uma função/serviço testável; verificar que a instalação atualiza os manifests, não introduz alertas próprios na auditoria e que o build resolve o import dinâmico.
- [x] 4.2 Integrar o botão Download Excel ao cabeçalho, exportando todos os registros filtrados e não apenas a página, com Nome, Descrição, Criado em e Atualizado em e sem campos técnicos; verificar com testes unitários o conteúdo sem filtro, com filtro, cabeçalhos, nome `.xlsx` e ausência de seleção/ações.

## 5. Feedback, qualidade e validação final

- [x] 5.1 Integrar os fluxos completos de criar, editar e excluir ao toast e overlay global, garantindo desbloqueio em sucesso e erro e atualização da tabela com a resposta persistida; verificar com testes de integração do componente cada resultado de mutação e proteção contra envio duplicado.
- [x] 5.2 Executar os testes unitários focados de modelo, serviço, repositório, view-model, exportação e componente de Variedades; corrigir falhas e verificar que todos terminam com sucesso.
- [x] 5.3 Executar a suíte completa, análise estática e build de produção; verificar que não há regressões, erros de template/TypeScript ou imports PrimeNG inválidos.
- [ ] 5.4 Fazer uma verificação manual em `/pomar/variedades` com o esquema Supabase atualizado, cobrindo carga, busca, paginação, exportação, inclusão, edição, exclusão individual/em lote, confirmações, toasts, bloqueio e envio de `updated_at` pelo aplicativo; registrar o resultado no checklist da mudança.
