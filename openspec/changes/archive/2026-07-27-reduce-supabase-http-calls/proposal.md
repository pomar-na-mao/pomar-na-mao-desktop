## Why

O app hoje executa varias chamadas independentes ao Supabase para montar telas e dados de apoio, incluindo leituras diretas de tabelas, RPCs e Edge Functions. Reduzir chamadas redundantes e consolidar respostas diminui latencia percebida, carga no projeto Supabase e risco de estados inconsistentes entre requisicoes paralelas.

## What Changes

- Introduzir uma estrategia padronizada para reutilizar respostas de leitura idempotentes no cliente, com cache em memoria, deduplicacao de requisicoes em andamento e invalidacao explicita apos mutacoes.
- Consolidar carregamentos de dados de apoio que hoje usam multiplas chamadas paralelas quando forem consumidos pela mesma tela ou fluxo.
- Avaliar e, quando aplicavel, criar ou ajustar RPCs/Functions para retornar snapshots de tela em uma unica chamada sem alterar o comportamento funcional visivel.
- Evitar chamadas repetidas causadas por efeitos reativos, mudancas de filtro equivalentes ou entrada rapida do usuario, usando chaves de consulta estaveis e controle de concorrencia.
- Adicionar instrumentacao local/testavel para comparar a quantidade de chamadas Supabase antes e depois das otimizacoes.
- Atualizar `database.md` sempre que a implementacao criar ou alterar RPC, Function, tabela, permissao ou politica Supabase.

## Capabilities

### New Capabilities
- `supabase-request-efficiency`: Define os requisitos para reduzir, deduplicar, consolidar e medir chamadas HTTP feitas pelo app Angular ao Supabase.

### Modified Capabilities
- Nenhuma. As otimizacoes devem preservar os requisitos funcionais existentes das telas e fluxos atuais.

## Impact

- Afeta servicos e repositorios em `src/app/data/services/**` e `src/app/data/repositories/**`, especialmente dashboard, operacoes, plantas, zonas, regioes e inclusao em massa.
- Pode afetar view-models em `src/app/ui/view-models/**` quando chamadas forem disparadas por effects, filtros ou estados compartilhados.
- Pode introduzir uma camada compartilhada de cache/deduplicacao para leituras Supabase.
- Pode exigir novas ou alteradas RPCs/Functions Supabase para snapshots de tela, com migracoes em `supabase/migrations/**` e documentacao em `database.md`.
- Exige testes unitarios cobrindo cache, deduplicacao, invalidacao e preservacao de dados retornados.
