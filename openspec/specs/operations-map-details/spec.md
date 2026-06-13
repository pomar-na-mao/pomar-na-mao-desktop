# operations-map-details Specification

## ADDED Requirements

### Requirement: Consulta de Pulverizações
A tela de operações SHALL consultar as operações de pulverização (`gps_track`) ativadas pelos filtros de tela e desenhá-las no mapa extraindo a geometria de `field_operation_routes`.

#### Scenario: Visualizar Pulverizações no Mapa
- **WHEN** o tipo de operação for "Pulverização" e dados existirem para a Data e Zona selecionadas
- **THEN** a aplicação DEVE renderizar as rotas dessas operações no formato espacial usando a API do Leaflet.

### Requirement: Detalhes da Rota
Ao clicar em uma rota renderizada, a aplicação SHALL exibir um card flutuante com os dados granulares vinculados àquela execução específica.

#### Scenario: Selecionar uma Rota
- **WHEN** o usuário clica em uma das linhas (rotas) desenhadas no mapa
- **THEN** um card na porção inferior direita DEVE aparecer.
- **THEN** este card DEVE apresentar os insumos aplicados, nome do operador, identificação da máquina e a contagem de pontos registrados pelo trator.
