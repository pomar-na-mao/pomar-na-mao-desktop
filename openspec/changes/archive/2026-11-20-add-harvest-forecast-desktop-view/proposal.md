## Why

As classificações de previsão de safra coletadas no aplicativo móvel já são consolidadas por planta em `public.harvest_forecasts`, mas o desktop ainda não oferece uma forma de localizar essas plantas no pomar nem transformar as classificações em uma estimativa de produção. A nova tela fecha esse fluxo operacional com filtros cartográficos e cálculo parametrizável por cenário, sem alterar a sincronização móvel existente.

## What Changes

- Adicionar a rota autenticada `/previsao-de-safra` e um item **Previsão de Safra** no menu principal imediatamente abaixo de **Mipd**.
- Criar uma tela no padrão visual e responsivo de `/meu-pomar`, com painel de filtros à esquerda e mapa à direita, preservando inicialmente somente o perímetro da fazenda e os polígonos das zonas, sem marcadores de plantas.
- Permitir filtrar previsões pelo período inclusivo de coleta em `harvest_forecasts.created_at`, por uma classificação válida (`N`, `P`, `M`, `G`, `GG`) ou pela opção padrão **Todas**, e por zona.
- Plotar uma única planta por registro consolidado de `harvest_forecasts`, usando a associação única `harvest_forecasts.plant_id = plants.id` e as cores `N` cinza, `P` azul, `M` amarelo, `G` laranja e `GG` vermelho, com rótulos/legenda para que a classificação não dependa apenas da cor.
- Oferecer os cenários **Otimista**, **Realista** e **Pessimista** e uma tabela editável de pesos em kg/pé para `P`, `M`, `G` e `GG`, iniciada respectivamente com `6/17/28/40`, `5/15/25/35` e `4/13/22/30`.
- Calcular, sob demanda pelo botão **Previsão**, os subtotais de `P`, `M`, `G` e `GG` e o total em quilogramas do conjunto filtrado, ignorando `N` no peso produzido e mantendo o card de resultado estruturado, porém sem valores, antes do primeiro cálculo.
- Criar uma migration SQL versionada com uma RPC de leitura autenticada para retornar as previsões e coordenadas das plantas conforme os filtros, sem executar alterações no projeto Supabase remoto.
- Atualizar `database.md` no item 20 com o processo desktop e no item 25 com a migration, contrato, segurança, implantação e rollback da RPC.
- Cobrir domínio, serviço, repositório, view model, componentes, mapa, cálculo, rota e ordem do menu com testes unitários.

## Capabilities

### New Capabilities

- `harvest-forecast-desktop-view`: Tela cartográfica, filtros, parametrização editável de cenários e cálculo da previsão de safra no desktop.
- `harvest-forecast-read-model`: Contrato de leitura Supabase para consultar, de forma autenticada e eficiente, as previsões consolidadas e as coordenadas atuais das plantas.

### Modified Capabilities

- `desktop-route-surface`: Acrescenta a rota autenticada de previsão de safra e sua entrada no menu imediatamente abaixo de Mipd.

## Impact

- **UI Angular:** nova vertical slice de previsão de safra, componentes de painel/mapa/card, rota lazy, item de menu e testes, reutilizando PrimeNG, Tailwind, Leaflet e os padrões de `/meu-pomar`.
- **Dados:** novos modelos, serviço, repositório e view model para a consulta filtrada e proteção contra respostas obsoletas; nenhuma escrita em `harvest_forecasts` pelo desktop.
- **Supabase:** nova RPC de leitura entregue somente como migration SQL versionada, com filtros opcionais, período inclusivo em `America/Sao_Paulo`, grants restritos e sem aplicação via MCP.
- **Documentação:** atualização de `database.md` nos itens 20 e 25, mantendo o contrato SQL documentado idêntico à migration.
- **Compatibilidade:** nenhuma mudança destrutiva na tabela, na unicidade de `plant_id` ou na RPC móvel `sync_harvest_forecasts`.
