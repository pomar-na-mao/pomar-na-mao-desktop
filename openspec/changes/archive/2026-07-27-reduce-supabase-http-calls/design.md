## Context

O app Angular 22 usa `@supabase/supabase-js` em servicos de dados com chamadas diretas a tabelas, RPCs e Edge Functions. As telas atuais carregam dados em camadas de service/repository/view-model, e alguns fluxos fazem chamadas paralelas para montar um unico estado de tela, como filtros do dashboard, opcoes da inclusao em massa, consultas de plantas por zona e operacoes por tipo.

Ja existem RPCs para snapshots e operacoes (`get_home_dashboard_snapshot`, `get_open_occurrences`, `get_spraying_operations`, `get_inspection_operations`, `get_annotation_operations`, `find_plants_inside_polygon`, `sync_polygon_bulk_update`). A mudanca deve reduzir chamadas sem trocar o modelo de autenticacao, sem expor chaves privilegiadas no cliente e sem alterar os resultados funcionais das telas.

## Goals / Non-Goals

**Rules:**

- Não alterar direto no supabase nenhuma RPC ou function, propor apenas se necessário

**Goals:**

- Reduzir chamadas HTTP redundantes ao Supabase para leituras idempotentes.
- Deduplicar chamadas simultaneas com a mesma chave de consulta, retornando a mesma Promise/resposta aos consumidores.
- Consolidar dados de apoio de uma mesma tela quando isso reduzir round-trips sem piorar acoplamento de forma significativa.
- Invalidar caches afetados apos insercoes, atualizacoes, exclusoes ou RPCs de sincronizacao.
- Adicionar testes unitarios para cache, deduplicacao, invalidacao e chamadas consolidadas.
- Documentar em `database.md` qualquer RPC, Function, tabela, permissao ou politica criada ou alterada.

**Non-Goals:**

- Implementar persistencia offline ou cache duravel em disco.
- Alterar regras de RLS, autenticacao ou permissoes fora do necessario para RPCs/Functions eventualmente ajustadas.
- Substituir `@supabase/supabase-js` por outro cliente HTTP.
- Mudar comportamento visual ou regras de negocio das telas.
- Otimizar chamadas a tiles do OpenStreetMap ou outros servicos externos que nao sejam Supabase.

## Decisions

1. Criar uma camada compartilhada de cache/deduplicacao para leituras Supabase no cliente.

   A implementacao deve ficar em um servico compartilhado no lado Angular, usado pelos repositories/services que executam leituras idempotentes. Cada consulta deve declarar uma chave estavel composta por dominio, operacao e parametros normalizados. Enquanto uma requisicao estiver em andamento, chamadas iguais devem reutilizar a mesma Promise; depois de resolvida, a resposta pode ser reutilizada conforme politica da chave.

   Alternativas consideradas:

- Cache isolado em cada repository: mais simples localmente, mas duplicaria regras e dificultaria invalidacao cruzada.
- Apenas RPCs consolidadas: reduz round-trips, mas nao resolve chamadas repetidas por efeitos reativos ou navegacao entre telas.
- Cache global sem chaves tipadas: rapido de implementar, mas arriscado para invalidacao e testes.

2. Usar politicas explicitas por consulta em vez de cache automatico para todas as chamadas Supabase.

   Cada leitura cacheavel deve informar se usa deduplicacao apenas em andamento, TTL curto ou cache ate invalidacao. Dados de referencia como zonas, regioes, variedades e tipos de ocorrencia podem usar cache ate invalidacao; listas sensiveis a filtros ou dashboard podem usar deduplicacao em andamento e TTL curto; mutacoes nao devem ser cacheadas.

   Alternativas consideradas:

- Interceptar todas as chamadas do SupabaseClient: pouco transparente e dificil de tipar.
- Usar apenas TTL fixo global: simples, mas pode deixar telas com dados obsoletos ou ainda fazer chamadas desnecessarias.

3. Consolidar endpoints por caso de uso, priorizando telas que ja fazem multiplas chamadas para montar um unico estado.

   A primeira analise deve priorizar:

- Dashboard: avaliar consolidar `getSnapshot`, `getFilterOptions` e `getOpenOccurrences`, ou pelo menos cachear dados de apoio e deduplicar snapshot por filtros.
- Inclusao em massa: consolidar opcoes `varieties` e `occurrence_types`, e reutilizar zonas ja carregadas.
- Operacoes: evitar refetches equivalentes ao alternar filtros/tipos, e considerar uma RPC unica para buscar tipos de operacao quando a UI precisar comparar mais de um tipo no mesmo intervalo.
- Plantas/contadores: substituir sequencias de counts independentes por snapshot unico quando o fluxo ainda usar esses metodos.

  Alternativas consideradas:

- Consolidar tudo em uma unica Function generica: reduz chamadas, mas cria um endpoint grande e acoplado demais.
- Manter chamadas paralelas e confiar apenas no navegador: nao reduz custo nem estabiliza estados de tela.

4. Invalidar por namespace depois de mutacoes.

   Insercao/exclusao de plantas deve invalidar caches de plantas, dashboard e contadores relacionados. `syncPolygonBulkUpdate` deve invalidar plantas, ocorrencias abertas, dashboard, operacoes e opcoes afetadas se necessario. Mutacoes de autenticacao devem continuar fora do cache de dados.

   Alternativas consideradas:

- Esperar TTL expirar: reduz complexidade, mas pode mostrar dados antigos apos alteracoes feitas pelo usuario.
- Invalidar todo o cache sempre: correto, mas perde grande parte do beneficio.

5. Medir reducao por testes e instrumentacao local.

   Os testes devem usar spies/mocks sobre os services Supabase para contar invocacoes. Onde fizer sentido, criar utilitario de medicao em ambiente de desenvolvimento para registrar quantidade de chamadas por fluxo sem enviar telemetria externa.

   Alternativas consideradas:

- Medir somente no DevTools manualmente: util para validacao exploratoria, mas nao previne regressao.
- Adicionar dependencia de observabilidade: fora do escopo para esta mudanca.

## Risks / Trade-offs

- Dados obsoletos em cache -> Mitigar com invalidacao por namespace apos mutacoes e TTL curto para dados volateis.
- Chaves de consulta inconsistentes -> Mitigar com helper de normalizacao de parametros e testes para filtros equivalentes.
- RPCs consolidadas grandes demais -> Mitigar criando endpoints por caso de uso, com contratos pequenos e documentados.
- Regressao silenciosa de contagem de chamadas -> Mitigar com testes unitarios que validem numero de chamadas ao Supabase nos fluxos otimizados.
- Mudanca de banco sem documentacao -> Mitigar incluindo tarefa obrigatoria para atualizar `database.md` sempre que RPC/Function/tabela/permissao/politica for criada ou alterada.
- Interacao ruim com RLS/permissoes -> Mitigar mantendo RPCs com contratos equivalentes aos dados ja acessiveis e revisando politicas/permissoes quando houver alteracao de banco.

## Migration Plan

1. Mapear chamadas Supabase por tela e classificar cada uma como mutacao, leitura volatil, leitura por filtro ou dado de referencia.
2. Implementar o servico compartilhado de cache/deduplicacao e migrar primeiro dados de referencia com baixo risco.
3. Migrar fluxos com chamadas repetidas por filtros/effects, mantendo os retornos publicos dos repositories.
4. Criar ou ajustar RPCs/Functions somente quando a consolidacao no cliente nao reduzir round-trips o suficiente.
5. Para cada alteracao Supabase, aplicar via MCP/CLI conforme fluxo do projeto, criar migracao, testar e atualizar `database.md`.
6. Rodar testes unitarios e build Angular.

Rollback:

- Desabilitar uso da camada de cache por chamada migrada, retornando ao caminho direto do service.
- Reverter migracoes de RPC/Function com migracao inversa quando alguma consolidacao no banco causar regressao.
- Manter contratos publicos dos repositories para reduzir impacto de rollback nas telas.

## Open Questions

- Qual meta numerica sera usada como criterio de aceite por tela: reducao percentual, numero maximo de chamadas por fluxo, ou ambos?
- O arquivo `database.md` ainda precisa ser criado neste repositorio ou existe em outro local esperado pelo projeto?
- A consolidacao do dashboard deve incluir `openOccurrences` no mesmo snapshot ou manter esse dado separado por ter frequencia de atualizacao diferente?
