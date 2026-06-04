## Why

A tela de entrada (`home` / `dashboard`) da aplicação precisa ser reestruturada para focar o usuário diretamente na visualização geográfica do pomar e nos principais indicadores de operações agrícolas. O novo layout, definido sob a referência de design Stitch, centraliza o mapa e organiza métricas operacionais reais e botões de ação mockados em painéis simétricos nas laterais, fornecendo uma visão geral imediata do estado das plantas, zonas, ocorrências e variedades no primeiro acesso à plataforma.

## What Changes

- **Layout Centrado no Mapa**: Substituição do cabeçalho, da barra de filtros e da lista de atividades recentes por um layout de três colunas:
  - Uma coluna esquerda contendo 4 cards em formato de botão empilhados verticalmente.
  - Uma coluna central ocupada pelo mapa Leaflet, exibindo todas as plantas na inicialização.
  - Uma coluna direita contendo 4 cards em formato de botão empilhados verticalmente.
- **Cards da Esquerda (Indicadores em Tempo Real)**: Carregamento de dados agregados no início do componente:
  - **Card 1 (Plantas)**: Mostra o total de registros na tabela `plants`.
  - **Card 2 (Zonas/Regiões)**: Mostra o total de registros na tabela `zones`.
  - **Card 3 (Ocorrências)**: Mostra o total de registros na tabela `occurrence_types`.
  - **Card 4 (Variedades)**: Mostra o total de registros na tabela `varieties` e exibe uma legenda de cores por variedade.
- **Plotagem e Colorização Determinística**: Plotar todas as plantas no mapa na carga inicial, atribuindo a cada marcador uma cor que corresponde à legenda do card de variedades.
- **Cards da Direita (Ações Mockadas)**: Cards com botões operacionais contendo títulos e valores fictícios:
  - **Card 1**: "Pulverizações" com o valor `1`.
  - **Card 2**: "Anotações" com o valor `28`.
  - **Card 3**: "Inspeções" com o valor `20`.
  - **Card 4**: "Colheita" com o valor `1`.

## Capabilities

### New Capabilities
- `home-map-dashboard`: Refatoração completa da tela home para centrar no mapa, com cards laterais e carregamento inicial de estatísticas operacionais do banco.

### Modified Capabilities
- None.

## Impact

- **Código Afetado**:
  - `src/app/ui/views/dashboard/dashboard.html`
  - `src/app/ui/views/dashboard/dashboard.ts`
  - `src/app/ui/views/dashboard/components/dashboard-map.ts`
  - `src/app/ui/view-models/dashboard/dashboard.view-model.ts`
  - `src/app/data/repositories/home-dashboard/home-dashboard-repository.ts`
- **APIs e Banco de Dados**:
  - Tabelas `plants`, `zones`, `occurrence_types` e `varieties` (Supabase).
- **UI/UX**:
  - Redesenho completo da tela principal para focar no mapa, com botões laterais de atalho e legenda interativa.
