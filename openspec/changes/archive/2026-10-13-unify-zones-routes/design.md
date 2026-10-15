# Design: Unificação das Rotas de Zonas e Atribuição

## Context

Atualmente, o sistema possui duas rotas separadas para o ecossistema de zonas:
1. `/atribuicao-zonas` (`ZoneAssignment`): formulário e mapa para atribuir plantas a zonas.
2. `/zonas` (`ZoneMapManagement`): formulário e mapa para desenhar e salvar polígonos de zonas no mapa.

Ambas as rotas utilizam componentes baseados no Leaflet (`MapPolygonSelector`) e possuem painel lateral de formulário + área de mapa full-height. Unificaremos as duas experiências sob a rota `/zonas`, gerenciada por um container unificado com navegação horizontal por abas (segmented control), alinhado com as diretrizes do guia `ui-ux-pro-max`.

## Goals / Non-Goals

**Goals:**
- Consolidar a navegação de Zonas sob a rota `/zonas`.
- Redirecionar acessos a `/atribuicao-zonas` para `/zonas?aba=atribuicao` (ou `/zonas`).
- Atualizar a barra lateral (`Sidebar`) removendo o item redundante e mantendo apenas `Zonas`.
- Criar um componente container unificado (`ZonesHub` ou `ZonesView`) que renderiza o menu horizontal e os dois fluxos de trabalho.
- Implementar o menu horizontal seguindo as diretrizes do `ui-ux-pro-max`:
  - Acessibilidade: `role="tablist"`, `role="tab"`, `aria-selected`, foco visível e touch targets de no mínimo 44px.
  - Estética visual: design limpo, segmented control moderno com suporte a modo claro e escuro, indicação ativa clara com tema esmeralda.
  - Ícones SVG claros para cada aba.
- Preservar estado dos formulários e mapas ao alternar abas, garantindo que o mapa redimensione corretamente (`invalidateSize()`).
- Suportar sincronização de aba via query param opcional (`?aba=gerenciamento` e `?aba=atribuicao`).

**Non-Goals:**
- Modificar o schema de banco de dados ou RPCs do Supabase.
- Alterar as regras de negócio de desenho de polígono ou de atribuição de plantas.

## Decisions

### Decisão 1: Container Unificado com Abas Client-Side vs Subrotas de Roteador
- **Opção A**: Subrotas filhas no Angular Router (`/zonas/cadastro` e `/zonas/atribuicao`).
- **Opção B**: Página única em `/zonas` com controle de abas via Signals e sincronização com Query Params (`?aba=...`).
- **Escolha**: **Opção B**. Cumpre a exigência direta do usuário de manter a rota `/zonas` e navegar na mesma página via menu horizontal, evitando destruição e recriação desnecessária de instâncias do mapa ao navegar.

### Decisão 2: Preservação de Estado do Mapa e Visibilidade
- **Opção A**: Usar `@if` condicional no template Angular.
  - *Problema*: Destrói e recria o mapa a cada troca de aba, perdendo o desenho ou zoom do usuário e demandando novas requisições.
- **Opção B**: Manter ambos os componentes montados e alternar visibilidade via classes CSS (`[class.hidden]`), chamando `invalidateSize()` na troca.
  - *Vantagem*: Preserva instantaneamente o estado do formulário e as seleções de polígono no mapa. Ao mudar de aba, um rápido `setTimeout(() => map.invalidateSize(), 0)` ajusta o layout sem falhas visuais.
- **Escolha**: **Opção B**.

### Decisão 3: Design do Menu Horizontal (UI/UX Pro Max)
- O menu horizontal será posicionado de maneira proeminente e elegante:
  - Uma barra superior compacta e integrada no topo do container de Zonas, com altura ergonômica (touch targets >= 44px).
  - Segmented control estilizado: fundo `bg-slate-100 dark:bg-slate-900/80` com borda sutil, botões com transição suave, cantos arredondados (`rounded-xl` ou `rounded-lg`).
  - Aba ativa com fundo contrastante (`bg-white dark:bg-slate-800`), sombra suave (`shadow-sm`), texto `text-emerald-700 dark:text-emerald-400` e tipografia semibold.
  - Ícones SVG semânticos antes de cada rótulo para reconhecimento visual imediato.

## Risks / Trade-offs

- **[Risco] Mapa apresentar renderização cinza ou ladrilhos cortados ao trocar de aba**  
  → **Mitigação**: Executar `invalidateSize()` no seletor de polígonos após a exibição da aba.
- **[Risco] Usuários com favoritos salvos para `/atribuicao-zonas` quebrarem navegação**  
  → **Mitigação**: Manter redirecionamento permanente no `app.routes.ts` de `atribuicao-zonas` para `zonas`.
