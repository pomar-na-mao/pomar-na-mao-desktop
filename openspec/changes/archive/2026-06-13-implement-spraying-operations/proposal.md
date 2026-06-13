## Why

Para gerenciar corretamente os processos operacionais em campo, o usuário precisa visualizar no mapa as rotas realizadas (conforme requisito 20.4 do database). Esta mudança atende especificamente o cenário de Pulverização (operações rastreadas via GPS) filtrando por data e zona, oferecendo o detalhamento de insumos e maquinário quando clicadas no mapa.

## What Changes

- No painel de filtros de Operações, será adicionado um dropdown para filtro de Zona (`zone_id`), similar ao existente no Dashboard.
- A seleção da operação "Pulverização" juntamente aos filtros de data irá buscar registros da tabela `field_operations` (onde `source = 'gps_track'`) baseados na data de criação (`created_at`) e na Zona.
- As rotas resultantes (`field_operation_routes`) serão carregadas e desenhadas no mapa.
- Ao clicar em uma dessas rotas no mapa, um novo "Card de Detalhes" será exibido no canto inferior direito do mapa contendo os detalhes do serviço: Produtos usados (`operation_inputs`), operador, máquina, e quantidade de pontos de rastreio (`field_operation_track_points`).

## Capabilities

### New Capabilities
- `operations-map-details`: Regras de interação para carregar e exibir rotas de operações no mapa e o card flutuante de detalhes.

### Modified Capabilities
- `operations-screen-ui`: Inclusão do filtro de zona no painel de filtros.

## Impact

- `OperationsFiltersPanel`: Modificado para carregar e exibir zonas do `ZoneRepository`.
- `OperationsViewModel`: Implementará consultas aos repositórios de `field_operations`, rotas e inputs.
- Supabase: Será necessária a criação/atualização de repositórios no client Angular para consultar as tabelas envolvidas (`field_operations`, `field_operation_routes`, `operation_inputs`, `field_operation_track_points`), podendo precisar de RPCs otimizados para dados geográficos.
