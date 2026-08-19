## Why

Hoje o sistema consome zonas no mapa, mas nao oferece uma tela dedicada para cadastrar uma nova zona a partir de um poligono desenhado. Isso obriga manutencao manual no Supabase e deixa `zones` e `regions` desalinhadas para plotagem posterior.

## What Changes

- Adicionar uma nova tela acessivel pela sidebar, imediatamente abaixo de `Inclusoes em Massa`, para cadastrar zonas por desenho no mapa.
- Reutilizar o mesmo layout de mapa da funcionalidade `/inclusoes-em-massa`, com painel lateral, mapa Leaflet e desenho de poligono fechado.
- Exibir, antes do salvamento, a lista de zonas existentes e um campo obrigatorio para informar o nome da nova zona.
- Ao salvar, criar primeiro um unico registro em `public.zones`; apos sucesso, inserir os pontos do poligono em `public.regions` para permitir a plotagem da nova zona.
- Validar nome unico, poligono fechado e quantidade minima de pontos antes de enviar a alteracao.
- Atualizar `database.md` nos itens 18, 20, 22, 24 e 25 para documentar o contrato de criacao de zona/regiao, incluindo a estrutura esperada de `regions` e `zones`.

## Capabilities

### New Capabilities
- `zone-polygon-management`: cobre a tela, validacoes e persistencia de novas zonas desenhadas no mapa.

### Modified Capabilities
- `desktop-route-surface`: adicionar a nova rota autenticada e o item correspondente na sidebar.

## Impact

- Angular: nova rota lazy-loaded, novo item de sidebar, view, formulario/painel lateral, view-model e possivel reaproveitamento/adaptacao do componente `MapPolygonSelector`.
- Data/domain: novos contratos para criacao de zona e pontos de regiao, alem de metodos em services/repositories para inserir em `zones` e `regions`.
- Supabase: gravacao transacional recomendada via RPC para inserir `zones` e `regions` de forma atomica; `database.md` deve documentar a RPC, RLS/policies e SQL consolidado.
- Cache: invalidar dados de referencia de `zones` e `regions` apos insercao bem-sucedida.
- Tests: unitarios para view-model, repository/service, validacoes de poligono/nome, rota/sidebar e tratamento de sucesso/erro.
