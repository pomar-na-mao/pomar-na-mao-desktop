## Context

A aplicação possui atualmente um Dashboard focado em produtividade e áreas. Para atender melhor o monitoramento no campo, foi solicitada uma nova tela de "Operações". Esta tela reaproveitará as decisões de design de interface do Dashboard (mapa + painel lateral esquerdo), mas focará nas atividades diárias: pulverização, inspeção e colheita.

## Goals / Non-Goals

**Goals:**
- Criar a rota `/operations` e conectá-line ao Sidebar e router.
- Desenvolver a UI inicial para o Operations com a mesma base estrutural do Dashboard, provendo a visualização de um mapa e um menu lateral de filtros.
- Garantir que o painel contenha exatamente dois filtros visuais e funcionais na UI: intervalo de datas (inicio e fim) e um dropdown `app-select` de operações.

**Non-Goals:**
- Integração de dados de backend para preenchimento do mapa nesta etapa inicial (a lógica real será feita num momento futuro).
- Alteração na lógica dos filtros para disparar consultas reais neste PR.
- Modificar o Dashboard existente.

## Decisions

- **Reaproveitamento vs Duplicação:**
  - Como a tela tem estrutura idêntica, vamos duplicar a estrutura principal (`operations.html`, `operations.ts`, `components/operations-map`, `components/operations-filters-panel`) ao invés de parametrizar o Dashboard para evitar acoplamento prematuro entre módulos que podem evoluir separadamente.
- **Componentes Compartilhados:**
  - Usaremos os componentes já criados de UI (`app-input`, `app-select`, `app-loading`) para manter a uniformidade visual e usabilidade.
- **Mock do ViewModel:**
  - Será criado um `OperationsViewModel` simplificado apenas para instanciar a estrutura do componente (controle de visibilidade de loading, ou estado simples de mapa) a ser preenchido futuramente.

## Risks / Trade-offs

- **Duplicação de Código (Risco)** → A duplicação da estrutura base do mapa gera código similar ao Dashboard.
  - **Mitigação:** Isso é uma troca consciente (trade-off) para manter a especialização da lógica em vez de um "Monster Component" genérico no futuro. Caso as telas estabilizem em 100% de similaridade, podemos abstrair em um layout de duas colunas posteriormente.
