## Why

A tela `/inicio` ja plota plantas e zonas, mas os poligonos de zona precisam respeitar a ordem real de coleta dos pontos para evitar contornos cruzados ou imprecisos. Alem disso, a area total da fazenda ja esta disponivel na nova tabela `farm` e deve aparecer no mapa assim que o Dashboard abrir.

## What Changes

- Plotar o poligono de uma zona selecionada usando os pontos de `regions` ordenados pela nova coluna inteira `order`.
- Garantir que o desenho da zona conecte os pontos em ordem incremental e feche o poligono somente depois de montar a sequencia ordenada.
- Carregar os pontos da tabela `farm` na abertura de `/inicio` e plotar automaticamente o poligono da fazenda no mapa.
- Usar latitude/longitude em ordem correta para Leaflet e manter longitude/latitude apenas onde GeoJSON ou contratos SQL exigirem.
- Se a RPC do snapshot do Dashboard ou outra RPC for alterada para retornar regioes/fazenda, atualizar o corpo correspondente em `database.md`.
- Adicionar testes unitarios para a ordenacao dos vertices de zona, montagem do poligono da fazenda e consumo do contrato de dados escolhido.

## Capabilities

### New Capabilities

### Modified Capabilities
- `home-map-dashboard`: O Dashboard passa a plotar poligonos de zona por ordem de coleta e a exibir o poligono da fazenda no carregamento inicial.

## Impact

- Frontend: tela `/inicio` em `src/app/ui/views/dashboard`, modelos de dominio relacionados ao snapshot do Dashboard e/ou pontos de regiao/fazenda, services/repositories que carregam dados do mapa.
- Supabase: possivel ajuste de RPC existente do Dashboard para incluir pontos ordenados de `regions` e `farm`, ou uso de consultas dedicadas se o padrao atual do projeto permitir.
- Database docs: qualquer RPC criada ou alterada deve ter o corpo atualizado em `database.md`, conforme regra do projeto.
- Tests: specs unitarios Angular/TypeScript para services/repositories e logica de montagem dos poligonos.
