## 1. Banco de Dados e RPC

- [x] 1.1 Criar a RPC `get_spraying_operations` via Supabase MCP para carregar as operações (`gps_track`), suas rotas (`field_operation_routes`) convertidas em GeoJSON, e um objeto extra agregando `operation_inputs` e contagem de `field_operation_track_points`.
- [x] 1.2 Documentar a implementação e criação da RPC `get_spraying_operations` atualizando o arquivo `database.md`.

## 2. Acesso a Dados e Modelos

- [x] 2.1 Criar/Atualizar modelos de domínio (`operations.model.ts`) para definir a interface `SprayingOperationResponse` que reflete o retorno da RPC.
- [x] 2.2 Criar um `OperationsRepository` injetando o cliente do Supabase para acessar a nova RPC.
- [x] 2.3 Implementar testes unitários para validar os métodos e o tratamento de erro do `OperationsRepository`.

## 3. Ajustes de Filtros e ViewModel

- [x] 3.1 Atualizar o `OperationsFiltersPanel` para injetar o `ZoneRepository` e implementar o dropdown de Seleção de Zona (`zone_id`).
- [x] 3.2 Ajustar o `OperationsViewModel` para controlar o estado dos filtros, realizar a busca via `OperationsRepository` e armazenar o resultado.
- [x] 3.3 Implementar testes unitários assegurando o comportamento correto dos filtros e da chamada de busca no `OperationsViewModel`.

## 4. Mapa e Card de Detalhes

- [x] 4.1 Modificar o componente `OperationsMap` para desenhar o payload em `L.geoJSON` das operações no mapa assim que os dados forem carregados.
- [x] 4.2 Ligar o evento `onEachFeature` do Leaflet.GeoJSON ao clique do usuário para armazenar a operação selecionada em `operationsViewModel.selectedOperation`.
- [x] 4.3 Criar o componente UI `OperationsMapDetailsCard` (como elemento flutuante - *absolute*) consumindo os dados da operação selecionada.
- [x] 4.4 Exibir os detalhes de operador, máquina, e a listagem visual dos produtos aplicados (badges de insumos) no card.
- [x] 4.5 Adicionar testes unitários garantindo as interações no mapa e a correta exibição das propriedades do card de detalhes.
