## 1. Configuração do Banco de Dados e RPC

- [x] 1.1 Criar a RPC `get_inspection_operations` no banco de dados Supabase para retornar inspeções, suas plantas e alterações de ocorrências.
- [x] 1.2 Atualizar o arquivo `database.md` adicionando a documentação e o script SQL de criação/execução da nova RPC `get_inspection_operations`.

## 2. Implementação da Camada de Dados

- [x] 2.1 Adicionar as interfaces e modelos de dados para `InspectionOperationResponse`, `InspectionPlant` e `InspectionPlantChange` em `src/app/domain/models/operations.model.ts`.
- [x] 2.2 Implementar o método `getInspectionOperations` em `src/app/data/services/operations/operations-service.ts` para invocar a RPC remota no Supabase.
- [x] 2.3 Implementar o método `getInspectionOperations` em `src/app/data/repositories/operations/operations-repository.ts` exposto através de um sinal do Angular.

## 3. Lógica do View Model e Integração com o Mapa

- [x] 3.1 Atualizar `OperationsViewModel` (`src/app/ui/view-models/operations/operations.view-model.ts`) para reagir à seleção do tipo de operação "Inspeção", buscando as operações de inspeção.
- [x] 3.2 Implementar a renderização das plantas alteradas no mapa Leaflet a partir do resultado da busca de inspeções.
- [x] 3.3 Adicionar lógica no `OperationsViewModel` para definir a planta selecionada e a operação correspondente ao clicar em um marcador de planta de inspeção.

## 4. Interface de Usuário e Cards de Detalhes

- [x] 4.1 Estender o componente `OperationsMapDetailsCard` (`src/app/ui/views/operations/components/operations-map-details-card.ts`) para renderizar condicionalmente os detalhes da planta inspecionada (ocorrências adicionadas e removidas).
- [x] 4.2 Ajustar a tela principal de operações (`operations.html` e `operations.ts`) para garantir o correto funcionamento da exibição do painel lateral de filtros e do mapa ao selecionar "Inspeção".

## 5. Testes Unitários

- [x] 5.1 Criar testes unitários para a busca de operações de inspeção em `src/app/data/repositories/operations/operations-repository.spec.ts`.
- [x] 5.2 Criar testes unitários no view-model `src/app/ui/view-models/operations/operations.view-model.spec.ts` para verificar o ciclo de vida da busca e atualização do estado das plantas de inspeção.
- [x] 5.3 Criar testes unitários para o card de detalhes em `src/app/ui/views/operations/components/operations-map-details-card.spec.ts` garantindo que os badges de adicionado/removido são exibidos corretamente.
