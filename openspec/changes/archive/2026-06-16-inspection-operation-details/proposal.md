## Why

Ao selecionar o tipo de operação "Inspeção" na tela de operações, os usuários atualmente não conseguem visualizar as operações de inspeção realizadas nem o detalhamento das alterações de ocorrências ocorridas nas plantas. Implementar isso permite monitorar de forma assertiva quais ocorrências (pragas, doenças, etc.) foram adicionadas ou removidas em cada planta durante uma inspeção.

## What Changes

- **Inspeção na Tela de Operações**: Permitir a seleção do Tipo de Operação "Inspeção".
- **Consulta de Operações de Inspeção**: Ao selecionar "Inspeção", buscar as operações de campo (`field_operations`) com `source` igual a `inspection` criadas no período e zona selecionados.
- **Visualização das Plantas Inspecionadas**: Buscar e exibir no mapa as plantas que foram alteradas na inspeção a partir da tabela `plant_operation_history`.
- **Card de Ocorrências**: Ao clicar em uma dessas plantas no mapa, exibir um card flutuante no canto inferior direito contendo o histórico de ocorrências adicionadas ou removidas na planta especificamente para aquela inspeção.

## Capabilities

### New Capabilities
- `inspection-operation-details`: Consulta e exibição de inspeções agrícolas, exibindo as plantas inspecionadas no mapa e os detalhes de ocorrências adicionadas/removidas de cada planta ao clicar nelas.

### Modified Capabilities

## Impact

- **Frontend**: Componentes e views em `src/app/ui/views/operations/` (`operations-filters-panel.ts`, `operations-map.ts`, `operations-map-details-card.ts`), view-model `operations.view-model.ts`, repositório `operations-repository.ts` e service `operations-service.ts`.
- **Database**: Consultas e novas RPCs para buscar operações de inspeção e plantas/ocorrências associadas, mantendo o arquivo `database.md` atualizado.
