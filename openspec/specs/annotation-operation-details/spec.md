# annotation-operation-details Specification

## Purpose
TBD - created by archiving change implement-annotation-operations. Update Purpose after archive.
## Requirements
### Requirement: Consulta de Anotações
A tela de operações SHALL consultar as operações de campo manuais (`source = 'manual'`) ativas pelos filtros de período e zona e retornar os dados de histórico de operações de plantas correspondentes.

#### Scenario: Filtrar por tipo Anotação
- **WHEN** o tipo de operação selecionado for "Anotação" e existir intervalo de datas e zona selecionados
- **THEN** o sistema DEVE disparar uma consulta para buscar as operações de campo com origem manual, incluindo as plantas anotadas e suas ocorrências adicionadas.

### Requirement: Exibição de Plantas Anotadas no Mapa
As plantas que possuem ocorrências anotadas na operação selecionada SHALL ser renderizadas como marcadores no mapa.

#### Scenario: Visualizar Plantas Anotadas no Mapa
- **WHEN** as operações de anotação retornarem plantas associadas na tabela `plant_operation_history`
- **THEN** a aplicação DEVE desenhar marcadores interativos para cada uma destas plantas no mapa.

### Requirement: Detalhes da Planta Anotada
Ao clicar em uma planta anotada renderizada no mapa de anotação, a aplicação SHALL exibir um card flutuante no canto inferior direito detalhando as ocorrências adicionadas naquela planta para aquela anotação específica.

#### Scenario: Clicar em Planta no Mapa de Anotação
- **WHEN** o usuário clica no marcador de uma planta correspondente a uma anotação
- **THEN** o sistema DEVE apresentar o card flutuante no canto inferior direito.
- **THEN** o card DEVE exibir a lista de ocorrências adicionadas (com tipo, severidade e observações/notas).

