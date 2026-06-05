## Why

O fluxo de inclusao em massa hoje permite associar ocorrencias as plantas dentro do poligono, mas nao oferece uma forma equivalente de remover uma ocorrencia aberta em lote. Isso obriga o usuario a resolver ocorrencias planta a planta mesmo quando a correcao se aplica a uma area inteira.

## What Changes

- Adicionar um toggle no formulario de inclusao em massa para escolher entre `Adicionar ocorrencia` e `Remover ocorrencia`.
- Manter o comportamento atual quando a acao for adicionar: para cada planta selecionada, criar ou atualizar ocorrencias com `status = 'open'` em `plant_occurrences`.
- Quando a acao for remover: para cada planta selecionada e tipo de ocorrencia selecionado, localizar ocorrencias abertas existentes e marcar como `resolved`.
- Ignorar plantas sem ocorrencia aberta correspondente durante a remocao, sem erro para o usuario.
- Ajustar o payload e a RPC `sync_polygon_bulk_update` para receber e aplicar o modo de acao da ocorrencia.
- Atualizar `database-and-features-organization.md` caso a RPC ou seu contrato sejam alterados.

## Capabilities

### New Capabilities

### Modified Capabilities
- `mass-inclusion-polygon-bulk-update`: adiciona o modo de acao para ocorrencias em inclusao em massa e define a semantica de remocao/resolucao.

## Impact

- Frontend Angular de inclusao em massa: formulario, view model, modelos de dominio, payload enviado ao service/repository e mensagens de sucesso.
- Supabase/Postgres: migration para atualizar `sync_polygon_bulk_update(jsonb)` e, se necessario, contadores retornados.
- Documentacao: `database-and-features-organization.md` deve refletir o contrato final da RPC.
- Testes unitarios de view model, service/repository e testes SQL ou verificacoes equivalentes para o novo comportamento.
