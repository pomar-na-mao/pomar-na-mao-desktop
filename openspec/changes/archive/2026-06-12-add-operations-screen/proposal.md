## Why

A tela de dashboard hoje concentra a visualização das fazendas e filtros básicos de data. No entanto, precisamos de uma tela dedicada para visualizar "Operações" no mapa, de forma que a interface e a filtragem sejam similares à tela de dashboard, mas exclusivas para dados operacionais (Pulverização, Inspeção e Colheita).

## What Changes

- Adição de uma nova rota `/operations` e item no menu lateral (Sidebar) chamado "Operações".
- Criação de uma tela visualmente idêntica ao dashboard (mapa na direita, painel de filtros na esquerda).
- O painel de filtros terá apenas dois campos: um filtro de período de data (inicio/fim) e um campo de seleção de operações contendo as opções fixas "Pulverização", "Inspeção" e "Colheita".
- Por enquanto, essa interface será apenas visual e sem integração com backend/ViewModel real para exibição dos dados operacionais.

## Capabilities

### New Capabilities
- `operations-screen-ui`: Tela de Operações, incluindo painel de filtros de data e tipo de operação e layout do mapa.

### Modified Capabilities
- `desktop-route-surface`: Adição da nova rota de Operações no sidebar e rotas do angular.

## Impact

- Afeta o componente `Sidebar` (novo item de menu).
- Afeta as configurações de rotas da aplicação (nova rota para o componente `Operations`).
- Cria novos arquivos de visualização para a tela de Operações na pasta de views (`src/app/ui/views/operations`).
