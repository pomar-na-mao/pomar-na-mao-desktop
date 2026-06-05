## Context

A tela de inclusao em massa usa o fluxo existente de poligono, previa de plantas e confirmacao para enviar um payload JSON para `sync_polygon_bulk_update(jsonb)`. Hoje o payload contem a lista de ocorrencias selecionadas, mas nao distingue entre adicionar e remover. A RPC trata ocorrencias selecionadas como associacoes a serem mantidas abertas: cria uma linha `open` em `plant_occurrences` quando nao existe ocorrencia aberta e atualiza a ocorrencia aberta mais recente quando ja existe.

O novo comportamento precisa manter esse caminho de adicao e acrescentar uma remocao logica: resolver ocorrencias abertas existentes para as plantas selecionadas. A escrita direta em tabelas auxiliares deve continuar controlada pela RPC.

## Goals / Non-Goals

**Goals:**
- Expor no formulario um toggle claro entre adicionar e remover ocorrencias.
- Enviar o modo selecionado no payload de `sync_polygon_bulk_update`.
- Manter a acao de adicionar compativel com o comportamento atual.
- Resolver ocorrencias abertas existentes quando a acao for remover.
- Ignorar pares planta/ocorrencia sem ocorrencia aberta durante remocao.
- Documentar qualquer alteracao de contrato da RPC em `database-and-features-organization.md`.

**Non-Goals:**
- Excluir linhas de `plant_occurrences`.
- Resolver ocorrencias com status diferente de `open`.
- Alterar o fluxo de desenho do poligono, previa ou selecao manual de plantas.
- Alterar a origem dos tipos de ocorrencia, variedades ou outros atributos de planta.

## Decisions

1. Representar o modo como `occurrenceAction` no payload, com valores `add` e `remove`.
   - Rationale: o payload atual ja agrupa as ocorrencias em uma lista; um unico campo de acao evita duplicar estruturas como `occurrencesToAdd` e `occurrencesToRemove`.
   - Alternative considered: enviar uma acao por ocorrencia. Isso permitiria misturar adicionar e remover na mesma confirmacao, mas aumenta a complexidade de UI e RPC sem estar no escopo pedido.

2. Tratar ausencia de `occurrenceAction` como `add` na RPC.
   - Rationale: preserva compatibilidade com clientes existentes e com testes que ainda montem payloads antigos durante a transicao.
   - Alternative considered: exigir sempre o campo novo. Isso deixaria o contrato mais estrito, mas aumentaria o risco de quebra em deploy incremental.

3. Resolver ocorrencias abertas com `status = 'resolved'`, mantendo historico.
   - Rationale: `plant_occurrences` e historica; remover fisicamente perderia auditoria. A regra solicitada tambem fala em "marcar como resolved".
   - Alternative considered: inserir uma nova linha de resolucao. Isso criaria historico explicito extra, mas o contrato atual da tabela ja possui status e a remocao pedida e uma transicao da ocorrencia aberta existente.

4. Atualizar todas as ocorrencias abertas correspondentes por planta/tipo durante remocao.
   - Rationale: se houver duplicidade de ocorrencias abertas para o mesmo par planta/tipo, a intencao operacional de remocao e deixar a planta sem aquela ocorrencia aberta.
   - Alternative considered: resolver apenas a ocorrencia aberta mais recente, espelhando o caminho de adicao. Isso deixaria duplicatas antigas ainda abertas e surpreenderia o filtro de ocorrencias atuais.

5. Manter `field_operations`, `field_operation_areas` e `plant_operation_history` para a operacao de remocao.
   - Rationale: a inclusao em massa deve continuar auditavel por poligono e por plantas selecionadas, mesmo quando algumas plantas nao tinham a ocorrencia aberta.
   - Alternative considered: registrar historico apenas para plantas com ocorrencia resolvida. Isso reduziria linhas de historico, mas perderia rastreabilidade da selecao confirmada.

## Risks / Trade-offs

- [Risk] O termo "Inclusao em massa" pode ficar semanticamente estranho para remover ocorrencias. -> Mitigation: manter o nome operacional existente por compatibilidade e deixar a mensagem de UI indicar quantas ocorrencias foram resolvidas.
- [Risk] Contadores atuais usam `occurrencesCreatedCount` e `occurrencesUpdatedCount`; remocao pode confundir "updated" com "resolved". -> Mitigation: usar `occurrencesUpdatedCount` para ocorrencias resolvidas se o contrato da RPC nao ganhar novo contador, e documentar isso. Se o design final adicionar `occurrencesResolvedCount`, atualizar modelos, service e documentacao.
- [Risk] Resolver todas as ocorrencias abertas duplicadas pode aumentar o contador alem do numero de plantas selecionadas. -> Mitigation: contar linhas efetivamente resolvidas e explicitar em testes.
- [Risk] Deploy frontend antes da migration faria a RPC ignorar ou rejeitar o novo campo dependendo da implementacao final. -> Mitigation: aplicar a migration antes ou junto do frontend e manter default `add`.

## Migration Plan

1. Criar migration que substitui `sync_polygon_bulk_update(jsonb)` com suporte a `occurrenceAction`.
2. Preservar grants da funcao para `authenticated` e revogar `public`/`anon` conforme contrato atual.
3. Atualizar `database-and-features-organization.md` com o novo campo do payload e a logica de add/remove.
4. Atualizar frontend e testes.
5. Rollback: restaurar a versao anterior da RPC e remover o campo novo do frontend, se necessario.

## Open Questions

- O resultado da RPC deve ganhar um contador especifico `occurrences_resolved_count`, ou o contador atual `occurrences_updated_count` deve representar tambem ocorrencias resolvidas?
