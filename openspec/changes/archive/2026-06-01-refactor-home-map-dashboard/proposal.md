## Why

A tela atual de `home` ainda reflete um dashboard genérico, com filtros e blocos que não seguem a composição visual nem os indicadores que o produto precisa destacar no primeiro acesso. A refatoração é necessária agora para transformar a home em uma visão operacional centrada no mapa, com métricas de plantas, zonas, ocorrências e variedades carregadas logo na abertura da tela.

## What Changes

- Refatorar a rota `home` para uma composição com mapa central como elemento principal da tela.
- Substituir o conjunto atual de cards e painéis laterais por duas colunas verticais de quatro cards em formato de botão, uma à esquerda e outra à direita do mapa.
- Carregar, ao iniciar a tela, os totais de `plants`, `zones`, `occurrence_types` e `varieties` e exibi-los nos quatro cards da esquerda.
- Exibir todas as plantas plotadas no mapa assim que o componente inicializar, sem depender de filtro manual inicial.
- Colorir as plantas no mapa conforme a variedade e mostrar, no card de variedades, uma legenda com uma cor por variedade.
- Exibir os quatro cards da direita com valores mockados para `Pulverizações`, `Anotações`, `Inspeções` e `Colheita`, sem lógica de backend por enquanto.
- Avaliar e, se necessário, introduzir uma RPC ou endpoint consolidado para retornar as métricas da tela e os dados de legenda de variedades em uma única carga inicial.

## Capabilities

### New Capabilities
- `home-map-dashboard`: Define a home operacional centrada no mapa, com métricas carregadas na inicialização, cards laterais e plotagem/colorização de plantas por variedade.

### Modified Capabilities
- None.

## Impact

- Affected code: `src/app/ui/views/dashboard/**`, `src/app/ui/view-models/dashboard/**`, `src/app/data/services/home-stats/**`, `src/app/data/repositories/plants/**`, e possivelmente novos serviços/repositórios para métricas consolidadas da home.
- APIs/systems: Supabase (`plants`, `zones`, `occurrence_types`, `varieties`) e possivelmente nova RPC/edge function para carga inicial da home.
- UI/UX: a home passa a priorizar mapa e cards operacionais, removendo a dependência da composição atual baseada em filtros e blocos auxiliares.
