## ADDED Requirements

### Requirement: Tela de Operações
A aplicação SHALL conter uma nova tela de operações acessível via rota `/operations`.

#### Scenario: Acesso a tela de operações
- **WHEN** o usuário acessa `/operations`
- **THEN** a tela de operações é carregada exibindo um layout estruturado em painel de filtros na esquerda e área principal de mapa na direita.

### Requirement: Filtros de Operações
O painel esquerdo da tela SHALL conter controles para filtrar por período de data e tipo de operação.

#### Scenario: Visualizar painel de filtros
- **WHEN** o painel de filtros for inspecionado
- **THEN** os únicos filtros exibidos DEVEM ser um campo de data inicial/final e um campo de seleção de operação.
- **THEN** o campo de seleção de operação DEVE conter as opções fixas: Pulverização, Inspeção e Colheita.
