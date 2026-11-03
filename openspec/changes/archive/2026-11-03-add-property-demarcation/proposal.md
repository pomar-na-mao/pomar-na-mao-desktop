## Why

O sistema já consome o perímetro da propriedade armazenado em `public.farm`, mas ainda não oferece uma tela dedicada para cadastrá-lo ou substituí-lo com segurança. A nova demarcação permitirá que o operador mantenha esse contorno diretamente no mapa, preservando a ordem espacial dos vértices usada pelas demais visualizações.

## What Changes

- Adicionar a tela autenticada **Demarcação propriedade** em `/cadastro/propriedade`, composta por um mapa de área total e controles de desenho inspirados no fluxo de `/dados-basicos`.
- Permitir desenhar e finalizar um único polígono fechado, mantendo a ordem de marcação dos vértices para preencher `farm.order` de `1` a `n`.
- Carregar os pontos existentes de `public.farm`, ordenar por `order`, renderizar o polígono e ajustar o zoom do mapa ao perímetro salvo.
- Disponibilizar campos de latitude e longitude e uma ação para centralizar e ampliar o mapa em coordenadas válidas informadas pelo usuário.
- Salvar o novo perímetro por uma RPC transacional que valida o payload, remove os pontos existentes e insere integralmente o novo conjunto, evitando estados parciais.
- Criar uma migration SQL executável para a nova RPC, com contrato, permissões e rollback documentados.
- Atualizar o catálogo de RPCs e o processo da funcionalidade na seção 20 do `database.md`, além de incorporar a função e suas permissões à query consolidada da seção 25.
- Adicionar testes unitários para rota, navegação, desenho/fechamento do polígono, foco por coordenadas, carregamento e persistência.

## Capabilities

### New Capabilities

- `property-demarcation`: Cadastro cartográfico do perímetro da propriedade, incluindo carregamento, desenho ordenado, foco por coordenadas e substituição atômica dos pontos de `farm`.

### Modified Capabilities

- `desktop-route-surface`: Expor `/cadastro/propriedade` e sua entrada **Demarcação propriedade** no grupo Cadastro da navegação autenticada.

## Impact

- **Frontend:** rotas e menu do Cadastro; nova view/view-model e componentes de mapa; possível extração ou extensão controlada do seletor de polígonos usado em `/dados-basicos`.
- **Dados:** modelo e serviço de `farm`, invalidação do cache de dados de referência após salvar e integração com a RPC de substituição.
- **Supabase:** nova função RPC transacional, grants para o papel autenticado e migration correspondente, aplicada pelo MCP do Supabase durante a implementação.
- **Documentação:** seções 18, 20 e 25 do `database.md`, incluindo contrato, SQL consolidado, implantação e rollback.
- **Qualidade:** testes unitários de UI, lógica de coordenadas, serviço/RPC, rotas e navegação.
