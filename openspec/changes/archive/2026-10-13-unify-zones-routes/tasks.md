## 1. Componente Unificado e Menu Horizontal (UI/UX Pro Max)

- [x] 1.1 Criar o componente unificado `Zones` em `src/app/ui/views/zones/zones.ts` e seu template `zones.html` contendo a barra de navegação horizontal (segmented control) estilizada com diretrizes UI/UX Pro Max (`role="tablist"`, `role="tab"`, `aria-selected`, targets de toque >= 44px, ícones SVG e contraste esmeralda/slate) e verificar renderização inicial.
- [x] 1.2 Integrar os painéis de `ZoneMapManagement` e `ZoneAssignment` no template unificado usando alternância de visibilidade (`[class.hidden]`) para preservar o estado de mapas e formulários, acionando `invalidateSize()` após alternância de aba e verificar dimensionamento no mapa.
- [x] 1.3 Implementar suporte a sincronização da aba ativa com query param `?aba=` via `ActivatedRoute` e `Router` para restaurar o estado selecionado diretamente da URL e verificar mudança de aba.

## 2. Rotas e Navegação Lateral (Sidebar)

- [x] 2.1 Atualizar `src/app/app.routes.ts` para mapear `/zonas` ao componente unificado e redirecionar a rota legada `atribuicao-zonas` para `zonas`, verificando o mapeamento de rotas.
- [x] 2.2 Atualizar `src/app/ui/views/layout/components/sidebar/sidebar.ts` para remover o item redundante `Atribuição de Zonas`, mantendo apenas `Zonas` na lista de navegação, e verificar itens renderizados.

## 3. Testes Unitários e Validação

- [x] 3.1 Criar testes unitários para o componente unificado `Zones` (`zones.spec.ts`) validando renderização das abas, acessibilidade, troca de estado e chamada de redimensionamento do mapa.
- [x] 3.2 Atualizar os testes unitários do Sidebar (`sidebar.spec.ts`) e de rotas (`app.routes.spec.ts`) para validar o menu consolidado e o redirecionamento de rota.
- [x] 3.3 Executar suíte de testes unitários e validação do TypeScript para garantir 100% de sucesso e ausência de regressões.
