## 1. Banco de dados e contrato de domínio

- [x] 1.1 Atualizar as duas definições de `public.occurrence_types` em `database.md` com `updated_at timestamptz not null default now()` e documentar o SQL incremental idempotente que copia `created_at` para registros existentes, sem trigger; verificar que o documento contém o contrato final e a sequência manual completa para o Supabase.
- [x] 1.2 Criar o modelo de domínio `OccurrenceType`, o rascunho com nome e código e os payloads de criação/edição com timestamps enviados pelo cliente; verificar com testes unitários e compilação TypeScript os tipos UUID, texto e datas.

## 2. Acesso a dados e estado

- [x] 2.1 Implementar o serviço de tipos de ocorrência com leitura ordenada, criação, atualização com retorno da linha persistida e exclusão em lote por UUIDs, incluindo timestamps, cache e invalidação das leituras relacionadas; verificar com testes unitários os encadeamentos Supabase, payloads, respostas de sucesso/erro e invalidações.
- [x] 2.2 Implementar o repositório de tipos de ocorrência com signal da coleção e atualizações locais somente após mutações bem-sucedidas; verificar com testes unitários carga, ordenação, inserção, substituição, exclusão múltipla e preservação do estado em falhas.
- [x] 2.3 Implementar o view-model de Ocorrências com carga inicial, formulário reativo compartilhado entre inclusão/edição, normalização de nome e código, seleção e fluxos assíncronos com toast e `LoadingService` em `try/finally`; verificar com testes unitários validação, mensagens, diálogo, bloqueio, código duplicado e recuperação de erros.

## 3. Tabela e ações de gerenciamento

- [x] 3.1 Substituir o componente vazio de `/pomar/ocorrencias` por uma tabela PrimeNG baseada em Variedades, exibindo seleção, nome, código, criação, atualização e ações sem uma coluna de ID, com datas `pt-BR`, ordenação, paginação, loading inicial e estados vazio/erro; verificar com testes de componente a carga e renderização das colunas e estados.
- [x] 3.2 Adicionar busca global por nome e código e seleção simples/múltipla com `p-tableCheckbox` e `p-tableHeaderCheckbox`; verificar com testes de componente filtragem sem diferenciar caixa, estado sem resultados e atualização da seleção.
- [x] 3.3 Adicionar o diálogo PrimeNG autocontido para criar e editar, com nome e código obrigatórios, preservação do rascunho em erro e botões acessíveis; verificar com testes de componente abertura nos dois modos, preenchimento, mensagens de validação, cancelamento e envio válido.
- [x] 3.4 Adicionar ações PrimeNG de editar, excluir uma linha e excluir selecionadas, com tooltips, nomes acessíveis e confirmação individual ou em lote antes da mutação; verificar com testes de componente identificação/contagem na confirmação, cancelamento sem exclusão, aceite, falha por referência e habilitação do botão em lote.

## 4. Exportação Excel

- [x] 4.1 Criar um serviço de exportação de ocorrências reutilizando `write-excel-file` por import dinâmico, com nome de arquivo datado e planilha contendo ID, Nome, Código, Criado em e Atualizado em; verificar com testes unitários linhas, cabeçalhos, formatação de datas, nome `.xlsx` e ausência de seleção/ações.
- [x] 4.2 Integrar o botão Download Excel ao cabeçalho, exportando todos os registros filtrados e não apenas a página visível; verificar com testes de componente os conteúdos exportados com e sem filtro e o toast de erro quando a geração falhar.

## 5. Integração e validação final

- [x] 5.1 Integrar os fluxos completos de criar, editar e excluir ao toast e overlay global, garantindo desbloqueio em sucesso e erro e atualização da tabela com a resposta persistida; verificar com testes de integração do componente cada resultado de mutação e a proteção contra envio duplicado.
- [x] 5.2 Executar os testes unitários focados de modelo, serviço, repositório, view-model, exportação e componente de Ocorrências; corrigir falhas e verificar que todos terminam com sucesso.
- [x] 5.3 Executar a suíte completa, análise estática e build de produção; verificar que não há regressões, erros de template/TypeScript ou imports PrimeNG inválidos.
- [ ] 5.4 Fazer uma verificação manual em `/pomar/ocorrencias` com o schema Supabase atualizado, cobrindo carga, busca, paginação, exportação, inclusão, edição, código duplicado, exclusão individual/em lote, restrições de referência, confirmações, toasts, bloqueio e envio de `updated_at`; registrar o resultado no checklist da mudança.

## 6. Categorização de ocorrências

- [x] 6.1 Documentar em `database.md` o enum `public.occurrence_category`, a coluna nullable `category` nas duas definições de `occurrence_types` e a migração segura de uma coluna textual existente; verificar os quatro literais e a ordem de conversão.
- [x] 6.2 Estender modelo, serviço, repositório/view-model e payloads com categoria tipada e obrigatória em novas gravações; verificar com testes unitários leitura, criação, edição, validação e compatibilidade com registros legados nulos.
- [x] 6.3 Adicionar Categoria à tabela e um select PrimeNG acessível aos formulários de inclusão e edição; verificar com testes de componente rótulos, preenchimento, obrigatoriedade e ausência de regressões nas ações existentes.
- [x] 6.4 Adicionar Categoria à exportação Excel e executar testes focados, suíte completa, lint e build; verificar conteúdo exportado e conclusão de todas as validações automatizadas.

## 7. Código automático e apresentação das categorias

- [x] 7.1 Ocultar `code` da tabela e dos formulários, limitar a busca visual ao nome e gerar o código automaticamente na criação com caixa baixa e palavras separadas por `_`, preservando o código existente na edição; verificar com testes unitários a normalização e os payloads de criação/edição.
- [x] 7.2 Aplicar cores estáveis distintas e brilho sutil aos rótulos de categoria somente na tabela, mantendo texto, contraste e fallback para registros não classificados; verificar a marcação e os estilos com teste de componente.
- [x] 7.3 Executar testes focados, suíte completa, lint, build de produção e validação estrita do change; corrigir regressões encontradas.
