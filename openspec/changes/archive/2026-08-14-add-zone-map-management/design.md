## Context

O app Angular ja possui a tela `/inclusoes-em-massa` com um layout adequado para desenho de poligono: painel lateral fixo a esquerda, mapa full-height a direita, Leaflet/OpenStreetMap e `MapPolygonSelector` emitindo GeoJSON fechado. Tambem ja existem `ZonesService` e `RegionsService`, mas o `database.md` documenta `zones` e nao formaliza a tabela `regions`, embora o modelo frontend atual indique pontos com `longitude`, `latitude` e `region`.

A nova funcionalidade deve cadastrar uma zona/regiao do pomar a partir de um poligono desenhado. O requisito funcional e criar um registro unico em `zones` e, somente se esse registro for criado com sucesso, inserir os pontos em `regions` para plotagem. Como isso afeta tabelas Supabase, o contrato deve ser refletido em `database.md` nos itens 18, 20, 22, 24 e 25.

Pelas diretrizes de UI/UX, a tela deve manter padroes operacionais: controles claros, labels reais em formularios, alvo minimo de toque, estados de loading/erro proximos da acao, contraste adequado e sem textos explicativos redundantes dentro da aplicacao. A skill `ui-ux-pro-max` nao trouxe scripts auxiliares instalados neste workspace, entao as regras do proprio `SKILL.md` foram aplicadas diretamente.

## Goals / Non-Goals

**Goals:**
- Criar uma tela autenticada para cadastrar zonas por desenho de poligono, acessivel pela sidebar abaixo de `Inclusoes em Massa`.
- Reutilizar ou adaptar o layout e a experiencia de desenho do `MapPolygonSelector` para manter consistencia visual.
- Carregar e listar zonas existentes antes do salvamento, ajudando o usuario a evitar duplicidade.
- Validar nome obrigatorio/unico e poligono com pelo menos 3 vertices antes da persistencia.
- Persistir a criacao de zona e pontos de regiao de forma atomica no Supabase.
- Atualizar `database.md` para documentar `regions`, `zones`, RPC, fluxo web, resumo, drop SQL e create SQL consolidado.
- Criar testes unitarios para rotas/sidebar, view-model, data layer e validacoes.

**Non-Goals:**
- Editar ou excluir zonas existentes.
- Mover plantas existentes para a nova zona automaticamente.
- Criar fluxo offline/SQLite para cadastro de zonas nesta tela web.
- Alterar o fluxo de inclusoes em massa alem de reaproveitar componentes.

## Decisions

### 1. Usar RPC transacional para salvar zona e pontos

Criar uma RPC `public.create_zone_with_regions(p_name text, p_code text default null, p_description text default null, p_polygon_geojson jsonb, p_points jsonb)` que valida entrada, insere `public.zones`, insere os vertices em `public.regions` e retorna a zona criada com contagem de pontos.

Alternativa considerada: chamar `.from('zones').insert()` e depois `.from('regions').insert()` no frontend. Isso e mais simples, mas permite estado parcial se `zones` for criada e `regions` falhar. A RPC tambem centraliza validacao de nome unico, geometria e permissoes.

### 2. Manter `zones` como entidade principal e `regions` como vertices

`zones` continua sendo a tabela de referencia para filtros, seletores e agrupamentos. A nova zona deve receber `polygon` com GeoJSON e `boundary` derivado do poligono quando PostGIS estiver disponivel. `regions` deve armazenar os pontos do contorno com referencia logica a zona, preferencialmente por `zone_id uuid references public.zones(id)`, preservando compatibilidade temporaria com o campo textual `region` se ele ja existir no banco atual.

Alternativa considerada: usar apenas `zones.polygon`. Isso atende parte da plotagem, mas nao cumpre o requisito explicito de adicionar os pontos em `regions`.

### 3. Reaproveitar a experiencia da tela de inclusoes em massa

A nova view deve seguir a estrutura de `/inclusoes-em-massa`: `aside` lateral com largura aproximada de 380px, mapa no restante da tela, botao de tela cheia e o mesmo componente de desenho de poligono quando possivel. O painel lateral da nova tela deve conter nome da zona, campos opcionais de codigo/descricao se encaixarem no contrato `zones`, lista escaneavel das zonas ja existentes e botoes limpar/salvar.

Alternativa considerada: tela de formulario separada do mapa. Isso reduz codigo de mapa, mas piora o fluxo principal, que depende de desenhar e revisar o poligono no mesmo contexto visual.

### 4. Invalidar cache de referencia apos criacao

Apos sucesso, o frontend deve invalidar os namespaces/operacoes de referencia de `zones.findAll`, `regions.findAll` e qualquer snapshot de mapa que consuma zonas, para que dashboard, operacoes e a propria tela reflitam a nova zona.

Alternativa considerada: atualizar apenas estado local. Isso deixa outras telas ou caches com dados desatualizados.

## Risks / Trade-offs

- `regions` nao esta documentada no `database.md` atual -> documentar a tabela no item 25 e alinhar modelo/servico antes de implementar inserts.
- Banco remoto pode ter schema de `regions` diferente do modelo frontend -> confirmar pelo MCP do Supabase durante implementacao e adaptar a migracao sem apagar dados existentes.
- GeoJSON invalido ou anel aberto pode quebrar PostGIS -> validar no frontend e na RPC, fechando o anel quando necessario e recusando menos de 3 vertices.
- Nome duplicado pode falhar por constraint `uq_zones_name` -> bloquear duplicidade no frontend e tratar erro da RPC com mensagem acionavel.
- Reaproveitar `MapPolygonSelector` pode acoplar comportamento de inclusao em massa -> se necessario, extrair um componente generico mantendo compatibilidade com a tela existente.

## Migration Plan

1. Verificar o schema real de `public.regions` via MCP do Supabase antes de aplicar SQL.
2. Atualizar `database.md` nos itens 18, 20, 22, 24 e 25 com a RPC, tabela/colunas de `regions`, fluxo web e SQL consolidado.
3. Criar ou ajustar a RPC `public.create_zone_with_regions` e grants/policies necessarios.
4. Implementar frontend e testes unitarios.
5. Validar com `tsc`, lint e testes.

Rollback: remover a rota/sidebar e a RPC criada. Registros de zona/regiao criados por uso real devem ser removidos manualmente apenas se o usuario confirmar, pois representam dados do pomar.

## Open Questions

- O schema remoto atual de `regions` tem `zone_id` ou apenas o campo textual `region`? A implementacao deve confirmar pelo Supabase MCP antes da migracao.
- O nome final da rota deve ser `/zonas` ou `/cadastro-zonas`? A proposta assume uma rota clara de gestao de zonas e o item de sidebar abaixo de `Inclusoes em Massa`.
