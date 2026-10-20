# Proposal: Unificar Rotas de Zonas e Atribuição de Zonas

## Why

Atualmente, o cadastro de zonas geográficas e a atribuição de plantas a essas zonas estão separados em duas rotas distintas no menu lateral (`/zonas` para cadastro/desenho e `/atribuicao-zonas` para atribuição). Essa divisão fragmenta o fluxo de trabalho do operador, ocupa espaço desnecessário na barra de navegação e dificulta a alternância rápida entre desenhar uma zona e associar plantas a ela. Unificar ambos os contextos sob a rota `/zonas` com navegação horizontal melhora a coerência da experiência do usuário (UX), otimiza o menu de navegação e consolida o domínio de zonas em um único ponto de acesso.

## What Changes

- **Unificação de Rotas**: Manter `/zonas` como a rota principal e consolidada. A rota antiga `/atribuicao-zonas` redirecionará automaticamente para `/zonas` (preservando compatibilidade).
- **Menu Lateral Consolidado**: Remoção do item redundante "Atribuição de Zonas" da barra lateral; o item "Zonas" permanece apontando para `/zonas`.
- **Menu Horizontal / Tab Bar na Página `/zonas`**: Implementação de navegação horizontal por abas (segmented control / horizontal menu) no topo da visualização de Zonas, permitindo alternar suavemente entre:
  - **Cadastro de Zonas** (Cadastro, edição e visualização de polígonos de zonas no mapa).
  - **Atribuição de Zonas** (Formulário e seleção de polígono para atribuir plantas às zonas existentes).
- **Design UI/UX Pro Max**: Interface limpa e ergonômica seguindo princípios de acessibilidade (`role="tablist"`, `role="tab"`, `aria-selected`, alvos de toque >= 44px), transições suaves, indicação visual clara da aba ativa com as cores do design system (esmeralda e slate), suporte total ao modo claro e escuro, e preservação do estado ou sincronização via query param opcional (`?aba=cadastro` / `?aba=atribuicao`).

## Capabilities

### New Capabilities
- `unified-zones-hub`: Define a interface e comportamento da página unificada de Zonas na rota `/zonas`, incluindo o menu horizontal de navegação entre Cadastro de Zonas e Atribuição de Zonas, acessibilidade de abas e controle de exibição de conteúdo.

### Modified Capabilities
- `desktop-route-surface`: Atualiza a superfície de rotas autenticadas e os itens de navegação do menu lateral para consolidar `/atribuicao-zonas` e `/zonas` em uma única entrada `/zonas`.

## Impact

- **Rotas (`app.routes.ts`)**: `/zonas` passa a carregar o componente unificado (ou hospedar as abas); `/atribuicao-zonas` passa a redirecionar para `/zonas`.
- **Sidebar (`sidebar.ts`)**: Remoção do item 'Atribuição de Zonas', mantendo 'Zonas'.
- **Views**: Nova view/container orquestrador `ZonesHub` (ou evolução de `ZoneMapManagement` / wrapper unificado) que hospeda a barra horizontal de navegação e renderiza os módulos correspondentes.
- **Testes**: Atualização dos testes unitários de rotas, sidebar e testes dos componentes afetados.
