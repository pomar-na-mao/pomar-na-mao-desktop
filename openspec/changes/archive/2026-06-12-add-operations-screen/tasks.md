## 1. Sidebar e Roteamento

- [x] 1.1 Adicionar rota `/operations` atrelada ao componente `Operations` nas rotas do Angular.
- [x] 1.2 Adicionar o item "Operações" (com seu respectivo ícone) no menu do componente `Sidebar`.

## 2. Estrutura Base e ViewModel

- [x] 2.1 Criar um `OperationsViewModel` simulado (mock) para instanciar estados simples (zoom do mapa, bounds, etc).
- [x] 2.2 Criar o componente principal `Operations` (`src/app/ui/views/operations/operations.ts` e `.html`) importando a estrutura do layout em duas colunas.

## 3. Painel de Filtros

- [x] 3.1 Criar o componente `OperationsFiltersPanel`.
- [x] 3.2 Implementar campos de filtro de Data de Início e Data de Fim no painel de filtros usando `app-input`.
- [x] 3.3 Implementar o campo de seleção de tipo de operação no painel usando `app-select`, adicionando as três opções fixas: Pulverização, Inspeção e Colheita.

## 4. Mapa e Integração Final

- [x] 4.1 Criar o componente `OperationsMap` instanciando um Leaflet map básico, sem carregar dados nesta etapa.
- [x] 4.2 Integrar o `OperationsFiltersPanel` e o `OperationsMap` dentro do `operations.html` garantindo o layout correto.
