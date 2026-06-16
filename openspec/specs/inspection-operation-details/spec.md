# inspection-operation-details Specification

## Purpose
TBD - created by archiving change inspection-operation-details. Update Purpose after archive.
## Requirements
### Requirement: Consulta de Inspeções
A tela de operações SHALL consultar as operações de inspeção (`source = 'inspection'`) ativas pelos filtros de período e zona e retornar os dados de histórico de operações de plantas correspondentes.

#### Scenario: Filtrar por tipo Inspeção
- **WHEN** o tipo de operação selecionado for "Inspeção" e existir intervalo de datas e zona selecionados
- **THEN** o sistema DEVE disparar uma consulta para buscar as operações de campo do tipo inspeção, incluindo as plantas inspecionadas e suas ocorrências adicionadas ou removidas.

### Requirement: Exibição de Plantas Alteradas no Mapa
As plantas que sofreram alteração (adicionada ou removida alguma ocorrência) na inspeção selecionada SHALL ser renderizadas como marcadores no mapa.

#### Scenario: Visualizar Plantas Alteradas no Mapa
- **WHEN** as operações de inspeção retornarem plantas associadas na tabela `plant_operation_history`
- **THEN** a aplicação DEVE desenhar marcadores interativos para cada uma destas plantas no mapa.

### Requirement: Detalhes da Planta Inspecionada
Ao clicar em uma planta alterada renderizada no mapa de inspeção, a aplicação SHALL exibir um card flutuante no canto inferior direito detalhando as ocorrências adicionadas ou removidas naquela planta para aquela inspeção específica.

#### Scenario: Clicar em Planta no Mapa de Inspeção
- **WHEN** o usuário clica no marcador de uma planta correspondente a uma inspeção
- **THEN** o sistema DEVE apresentar o card flutuante no canto inferior direito.
- **THEN** o card DEVE exibir a lista de ocorrências adicionadas (com tipo, severidade e notas) e de ocorrências removidas/resolvidas (com tipo e notas).

