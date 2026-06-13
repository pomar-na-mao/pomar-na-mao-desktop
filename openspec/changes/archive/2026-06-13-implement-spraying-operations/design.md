## Context

A tela de operações possui a estrutura base de UI, mas encontra-se estática e desconectada de dados. Para viabilizar a análise de operações em campo (como Pulverização), é preciso recuperar os registros de rastreio (`field_operations` com `source = 'gps_track'`), carregar suas trajetórias espaciais (`field_operation_routes`) e permitir o detalhamento dessas execuções, como listar insumos gastos (`operation_inputs`).

## Goals / Non-Goals

**Goals:**
- Integrar um filtro de Zonas ao painel lateral, buscando dados do `ZoneRepository`.
- Definir a interface e implementação da consulta de Operações no banco de dados.
- Criar uma RPC no Supabase (se necessário) para agregar as geometrias das rotas (`route`) em formato GeoJSON e contar/extrair detalhes em um único request.
- Renderizar as rotas extraídas com a API do Leaflet e Leaflet.GeoJSON.
- Construir o componente do Card de Detalhes (Operador, Máquina, Insumos e Quantidade de Pontos) atrelado ao clique na geometria no mapa.
- Registrar eventuais adições de RPC no documento `database.md`.

**Non-Goals:**
- Mostrar detalhes granulares de todos os `track_points` individualmente no mapa (apenas a rota e a contagem deles no card).
- Implementar a lógica para os tipos "Inspeção" e "Colheita" neste PR.

## Decisions

- **Busca de Dados via RPC:**
  - Em vez de realizar queries PostgREST diretas encadeando relacionamentos (`select="*, field_operation_routes(*), operation_inputs(*)"`), vamos criar uma RPC `get_spraying_operations(p_start_date, p_end_date, p_zone_id)` no banco.
  - Racional: Geometrias `extensions.geography` precisam ser convertidas usando `ST_AsGeoJSON()` para chegarem limpas ao frontend. Uma RPC nos permite empacotar a operação, a rota (já em GeoJSON), os insumos da operação, e o count de `field_operation_track_points`, tudo retornado numa view estruturada.
- **Renderização e Componente Flutuante:**
  - O clique no path do GeoJSON da rota mudará um state no `OperationsViewModel.selectedOperation`.
  - Um novo componente `OperationsMapDetailsCard` assinará esse sinal e renderizará os detalhes com sobreposição absoluta sobre o mapa (`absolute bottom-4 right-4 z-[400]`).

## Risks / Trade-offs

- **Tamanho do Payload GeoJSON (Risco):**
  Rotas de trator podem ter milhares de vértices, gerando payloads pesados se o filtro de data retornar centenas de operações de uma vez.
  - **Mitigação:** Como `field_operation_routes` armazena a rota consolidada usando algoritmos de simplificação em sua criação, o peso costuma ser aceitável. Se escalar muito, a RPC pode aplicar `ST_Simplify` limitando a resolução visual na consulta de múltiplos dias. O filtro de zona obrigatório ou sugerido já reduz significativamente a carga.
